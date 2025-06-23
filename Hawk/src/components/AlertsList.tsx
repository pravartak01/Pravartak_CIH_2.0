import React, { useState, useCallback, useEffect } from 'react';
import AlertCard from './AlertCard';
import SearchFilters from './SearchFilters';
import { Alert } from '../types';
import { supabase } from '../integrations/supabase/client';
import { AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

const AlertsList = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ severity: string[]; status: string[] }>({
    severity: [],
    status: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform data to match our Alert type
      const formattedAlerts: Alert[] = data.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        date: alert.date,
        system: alert.system,
        cve: alert.cve || undefined,
        status: alert.status as 'new' | 'acknowledged' | 'resolved',
        mitigation: alert.mitigation || undefined,
        patchLink: alert.patch_link || undefined,
        details: alert.details as Record<string, any> | undefined,
      }));

      setAlerts(formattedAlerts);
      console.log(`Fetched ${formattedAlerts.length} real alerts from database`);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterAlerts = useCallback(() => {
    let result = [...alerts];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(alert => 
        alert.title.toLowerCase().includes(query) || 
        alert.system.toLowerCase().includes(query) || 
        (alert.cve && alert.cve.toLowerCase().includes(query)) ||
        alert.description.toLowerCase().includes(query)
      );
    }
    
    // Apply severity filter
    if (filters.severity.length > 0) {
      result = result.filter(alert => filters.severity.includes(alert.severity));
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(alert => filters.status.includes(alert.status));
    }
    
    return result;
  }, [searchQuery, filters, alerts]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: { severity: string[]; status: string[] }) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAlerts();
  };

  const handleStatusChange = async (alertId: string, newStatus: 'new' | 'acknowledged' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: newStatus })
        .eq('id', alertId);

      if (error) throw error;

      // Update the local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: newStatus } 
            : alert
        )
      );
      
      toast.success(`Alert status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error('Failed to update alert status');
    }
  };

  // Update filtered alerts when dependencies change
  useEffect(() => {
    setFilteredAlerts(filterAlerts());
  }, [searchQuery, filters, filterAlerts, alerts]);

  // Initial data fetch
  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'alerts' 
      }, (payload) => {
        console.log('Real-time alert update:', payload);
        fetchAlerts(); // Refresh all alerts when changes occur
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Alerts</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
          <button 
            onClick={handleRefresh}
            className={`p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors`}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? <Loader className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      <SearchFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 glass-card rounded-lg">
          <Loader className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-gray-500">Loading alerts...</p>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <div 
              key={alert.id}
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <AlertCard 
                alert={alert} 
                onStatusChange={(newStatus) => handleStatusChange(alert.id, newStatus)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium mb-1">No alerts matching the current filters</p>
          <p className="text-sm text-gray-400 mb-4">Try changing your search or filter criteria</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilters({ severity: [], status: [] });
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
