import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import NotificationForm from './notification/NotificationForm';
import AlertPreferences from './notification/AlertPreferences';
import NotificationActions from './notification/NotificationActions';
import DebugPanel from './notification/DebugPanel';
import { useNotificationSettings } from './notification/useNotificationSettings';

const NotificationSystem: React.FC = () => {
  const { user, session } = useAuth();
  const {
    form,
    isLoading,
    saveSuccess,
    debug,
    setDebug,
    emailEnabled,
    smsEnabled,
    handleSaveSettings
  } = useNotificationSettings();
  
  const handleTestNotification = async () => {
    if (!user || !session) {
      toast.error("You must be logged in to test notifications");
      return;
    }
    
    try {
      // Save current settings first to ensure test uses latest configuration
      await form.handleSubmit(handleSaveSettings)();
      
      toast.info('Sending test notification...', {
        description: 'This may take a few moments'
      });
      
      // Create an in-app notification first
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Test Notification',
          content: 'This is a test notification from HAWK Security.',
          type: 'test',
          is_read: false,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });
      
      if (insertError) throw insertError;
      
      console.log("Sending test notification via edge function");
      const currentEmailAddress = form.getValues().emailEnabled ? form.getValues().emailAddress : '';
      const currentPhoneNumber = form.getValues().smsEnabled ? form.getValues().phoneNumber : '';
      console.log("Using email address for test:", currentEmailAddress);
      console.log("Using phone number for test:", currentPhoneNumber);
      
      try {
        // Create the request body with all necessary information
        const requestBody = { 
          userId: user.id,
          action: 'test-notification',
          email: currentEmailAddress,
          phone: currentPhoneNumber,
          scanResults: [{
            severity: 'critical',
            title: 'Test Vulnerability',
            description: 'This is a test notification to verify your notification settings.',
            system: 'Test System',
            cve: 'TEST-2023-0001'
          }],
          scanType: 'test',
          severity: 'critical'
        };
        
        // Log detailed information for debugging
        console.log("Sending request to edge function with body:", JSON.stringify(requestBody));
        
        const { data, error } = await supabase.functions.invoke('send-notifications', {
          body: requestBody
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
        }
        
        if (!data) {
          throw new Error("No data returned from edge function");
        }
        
        console.log("Test notification response:", data);
        setDebug(`Test notification response: ${JSON.stringify(data, null, 2)}`);
        
        let toastDescription = "";
        if (data.email_sent && data.sms_sent) {
          toastDescription = "Check your email, SMS, and the notification bell in the top navigation bar";
        } else if (data.email_sent) {
          toastDescription = "Check your email and the notification bell in the top navigation bar";
        } else if (data.sms_sent) {
          toastDescription = "Check your SMS and the notification bell in the top navigation bar";
        } else {
          toastDescription = "Check the notification bell in the top navigation bar";
        }
        
        toast.success('Test notification sent successfully', {
          description: toastDescription
        });
        
        if (data.email_error) {
          toast.error('Email notification failed', {
            description: data.email_error
          });
        }
        
        if (data.sms_error) {
          toast.error('SMS notification failed', {
            description: data.sms_error
          });
        }
      } catch (functionError: any) {
        console.error("Edge function invocation error:", functionError);
        throw new Error(`Failed to send test notification: ${functionError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setDebug(`Test error: ${error instanceof Error ? error.message : JSON.stringify(error, null, 2)}`);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <CardDescription>Configure how and when you receive vulnerability alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
            <NotificationForm 
              form={form} 
              emailEnabled={emailEnabled}
              smsEnabled={smsEnabled}
            />
            
            <AlertPreferences form={form} />
            
            <NotificationActions 
              handleTestNotification={handleTestNotification}
              isLoading={isLoading}
              saveSuccess={saveSuccess}
            />
          </form>
        </Form>
        
        <DebugPanel debug={debug} />
      </CardContent>
    </Card>
  );
};

export default NotificationSystem;
