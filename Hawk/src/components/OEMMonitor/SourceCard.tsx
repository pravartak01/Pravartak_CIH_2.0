
import React from 'react';
import { Edit, Loader, RefreshCw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { OEMSource } from '@/types';

interface SourceCardProps {
  source: OEMSource;
  isTestingSource: string | null;
  onEdit: (source: OEMSource) => void;
  onDelete: (sourceId: string) => void;
  onToggleActive: (sourceId: string, isActive: boolean) => void;
  onTest: (source: OEMSource) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({
  source,
  isTestingSource,
  onEdit,
  onDelete,
  onToggleActive,
  onTest
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{source.name}</span>
          <div className="flex items-center gap-1">
            <Switch 
              checked={source.is_active}
              onCheckedChange={(checked) => onToggleActive(source.id, checked)}
            />
          </div>
        </CardTitle>
        <CardDescription className="truncate">{source.url}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">System Type:</span>
            <span className="font-medium">{source.system_type}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Last Checked:</span>
            <span className="font-medium">
              {source.last_checked 
                ? new Date(source.last_checked).toLocaleString() 
                : 'Never'}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${source.is_active ? 'text-green-600' : 'text-gray-500'}`}>
              {source.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => onEdit(source)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(source.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onTest(source)}
          disabled={isTestingSource === source.id}
        >
          {isTestingSource === source.id ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Test Source
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SourceCard;
