
import React, { useState, useEffect } from 'react';
import { Loader, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { OEMSource } from '@/types';
import { 
  fetchUserOEMSources, 
  addOEMSource, 
  updateOEMSource, 
  deleteOEMSource, 
  testOEMSource 
} from '@/services/oemService';
import AddSourceDialog from './AddSourceDialog';
import SourceCard from './SourceCard';
import EditSourceForm from './EditSourceForm';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FirecrawlService } from '@/utils/FirecrawlService';

const OEMMonitorList: React.FC = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState<OEMSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingSource, setIsTestingSource] = useState<string | null>(null);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<OEMSource | null>(null);
  const [isDetectingOEMs, setIsDetectingOEMs] = useState(false);
  const [suggestedOEMs, setSuggestedOEMs] = useState<Array<{name: string, url: string, systemType: string}>>([]);

  const loadSources = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await fetchUserOEMSources(user.id);
    setSources(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSources();
  }, [user]);

  const handleAddSource = async (name: string, url: string, systemType: string) => {
    try {
      setIsAddingSource(true);
      
      if (!name || !url || !systemType) {
        return;
      }
      
      if (!user) {
        return;
      }

      const newSource = await addOEMSource(user.id, name, url, systemType);
      
      if (newSource) {
        setSources(prev => [newSource, ...prev]);
      }
      
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleToggleActive = async (sourceId: string, isActive: boolean) => {
    const success = await updateOEMSource(sourceId, { is_active: isActive });
    
    if (success) {
      setSources(prev => 
        prev.map(source => 
          source.id === sourceId ? { ...source, is_active: isActive } : source
        )
      );
    }
  };

  const handleUpdateSource = async (updatedSource: OEMSource) => {
    const { id, name, url, system_type } = updatedSource;
    const success = await updateOEMSource(id, { name, url, system_type });
    
    if (success) {
      setSources(prev => 
        prev.map(source => 
          source.id === id ? updatedSource : source
        )
      );
    }
    
    setEditingSource(null);
  };

  const handleDeleteSource = async (sourceId: string) => {
    const success = await deleteOEMSource(sourceId);
    
    if (success) {
      setSources(prev => prev.filter(source => source.id !== sourceId));
    }
  };

  const handleTestSource = async (source: OEMSource) => {
    setIsTestingSource(source.id);
    await testOEMSource(source);
    setIsTestingSource(null);
  };

  const handleDetectOEMs = async () => {
    try {
      setIsDetectingOEMs(true);
      setSuggestedOEMs([]);
      
      // Get unique system types from existing sources
      const systemTypes = [...new Set(sources.map(source => source.system_type))];
      
      // If no existing sources, use some common categories
      const typesToDetect = systemTypes.length > 0 
        ? systemTypes 
        : ['network', 'server', 'storage', 'security', 'firmware'];
      
      let allSuggestions: any[] = [];
      
      // Detect OEMs for each system type
      for (const systemType of typesToDetect) {
        const result = await FirecrawlService.detectOEMWebsites(systemType);
        
        if (result.success && result.data.suggestions) {
          // Filter out suggestions that match existing sources
          const newSuggestions = result.data.suggestions.filter(
            (suggestion: any) => !sources.some(source => 
              source.url.includes(suggestion.url) || 
              source.name.toLowerCase() === suggestion.name.toLowerCase()
            )
          );
          
          allSuggestions = [...allSuggestions, ...newSuggestions];
        }
      }
      
      // Limit to 5 suggestions
      setSuggestedOEMs(allSuggestions.slice(0, 5));
      
      if (allSuggestions.length === 0) {
        toast.info('No new OEM sources detected');
      }
    } catch (error) {
      console.error('Error detecting OEMs:', error);
      toast.error('Failed to detect OEM sources');
    } finally {
      setIsDetectingOEMs(false);
    }
  };

  const handleAddSuggestedOEM = async (suggestion: {name: string, url: string, systemType: string}) => {
    await handleAddSource(suggestion.name, suggestion.url, suggestion.systemType);
    // Remove from suggestions after adding
    setSuggestedOEMs(prev => prev.filter(s => s.url !== suggestion.url));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">OEM Websites Monitoring</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleDetectOEMs} 
            disabled={isDetectingOEMs}
          >
            {isDetectingOEMs ? (
              <Loader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            Auto-Detect OEMs
          </Button>
          <AddSourceDialog 
            isAddingSource={isAddingSource}
            onAddSource={handleAddSource}
          />
        </div>
      </div>

      {suggestedOEMs.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <h4 className="text-sm font-medium mb-2">Suggested OEM Sources</h4>
          <div className="grid gap-2">
            {suggestedOEMs.map((suggestion, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                <div>
                  <p className="text-sm font-medium">{suggestion.name}</p>
                  <p className="text-xs text-gray-500">{suggestion.url}</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleAddSuggestedOEM(suggestion)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sources.length === 0 ? (
        <EmptyState onAddFirst={() => setIsDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source) => (
            editingSource?.id === source.id ? (
              <EditSourceForm 
                key={source.id}
                source={editingSource}
                onUpdate={handleUpdateSource}
                onCancel={() => setEditingSource(null)}
              />
            ) : (
              <SourceCard 
                key={source.id}
                source={source}
                isTestingSource={isTestingSource}
                onEdit={setEditingSource}
                onDelete={handleDeleteSource}
                onToggleActive={handleToggleActive}
                onTest={handleTestSource}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default OEMMonitorList;
