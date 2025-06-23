
import React, { useState } from 'react';
import { Alert } from '@/types';
import { generateRecommendations } from '@/utils/securityUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, Shield, ExternalLink, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActionRecommendationsProps {
  alert: Alert;
  onActionClick?: (action: string) => void;
}

const ActionRecommendations: React.FC<ActionRecommendationsProps> = ({
  alert,
  onActionClick
}) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const recommendations = generateRecommendations(alert);
  
  // Determine timeline based on severity
  const getTimeline = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Immediate action required';
      case 'high': return 'Action required within 7 days';
      case 'medium': return 'Action required within 30 days';
      case 'low': return 'Address in regular maintenance cycle';
      default: return 'Action timeline undetermined';
    }
  };

  // Calculate days remaining based on severity
  const getRemainingDays = (severity: string) => {
    const alertDate = new Date(alert.date);
    const currentDate = new Date();
    const daysSinceAlert = Math.floor((currentDate.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (severity) {
      case 'critical': return 1 - daysSinceAlert;
      case 'high': return 7 - daysSinceAlert;
      case 'medium': return 30 - daysSinceAlert;
      case 'low': return 90 - daysSinceAlert;
      default: return null;
    }
  };
  
  const daysRemaining = getRemainingDays(alert.severity);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Handle action button clicks with loading state
  const handleActionClick = async (action: string) => {
    if (onActionClick) {
      setIsLoading(prev => ({ ...prev, [action]: true }));
      try {
        // Call the parent handler
        onActionClick(action);
        
        // Also update the notification system with this action
        await supabase.from('notifications').insert({
          user_id: 'system', // Or get from auth context if available
          title: `Alert ${action}`,
          content: `The alert ${alert.title} has been ${action}`,
          type: 'alert_update',
          is_read: false,
          metadata: { alertId: alert.id, action }
        });
      } catch (error) {
        console.error(`Error handling ${action} action:`, error);
        toast.error(`Failed to ${action} the alert. Please try again.`);
      } finally {
        setIsLoading(prev => ({ ...prev, [action]: false }));
      }
    }
  };
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{getTimeline(alert.severity)}</span>
          </div>
          
          {daysRemaining !== null && (
            <Badge 
              variant={isOverdue ? "destructive" : "outline"} 
              className={isOverdue ? "bg-red-100 text-red-800" : "bg-blue-50 text-blue-700"}
            >
              {isOverdue 
                ? `Overdue by ${Math.abs(daysRemaining)} days` 
                : `${daysRemaining} days remaining`}
            </Badge>
          )}
        </div>
        
        <ul className="space-y-2 mb-4">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
        
        {alert.patchLink && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
            <h4 className="text-sm font-medium mb-1 text-blue-800">Patch Information</h4>
            <a 
              href={alert.patchLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Official Patch Details
            </a>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            onClick={() => handleActionClick('acknowledge')}
            variant={alert.status === 'acknowledged' ? "default" : "outline"}
            disabled={isLoading['acknowledge']}
          >
            {isLoading['acknowledge'] ? (
              <>
                <Loader className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Acknowledge'
            )}
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleActionClick('resolve')}
            variant={alert.status === 'resolved' ? "default" : "outline"}
            disabled={isLoading['resolve']}
          >
            {isLoading['resolve'] ? (
              <>
                <Loader className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Mark Resolved'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionRecommendations;
