
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save } from 'lucide-react';

interface NotificationActionsProps {
  handleTestNotification: () => Promise<void>;
  isLoading: boolean;
  saveSuccess: boolean;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
  handleTestNotification,
  isLoading,
  saveSuccess
}) => {
  return (
    <div className="flex justify-between pt-4">
      <Button 
        type="button"
        variant="outline" 
        onClick={handleTestNotification}
        disabled={isLoading}
      >
        Send Test Notification
      </Button>
      
      <Button 
        type="submit"
        disabled={isLoading}
        className={saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        {saveSuccess ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Saved!
          </>
        ) : isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
};

export default NotificationActions;
