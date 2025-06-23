
import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onAddFirst: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddFirst }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No OEM Sources Added</h3>
        <p className="text-muted-foreground mb-4">
          Add vendor websites to monitor for security vulnerabilities relevant to your systems.
        </p>
        <Button 
          variant="outline" 
          onClick={onAddFirst} 
          className="mx-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Your First Source
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
