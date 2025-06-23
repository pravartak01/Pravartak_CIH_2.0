
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { NotificationSettings } from './types';

interface NotificationFormProps {
  form: UseFormReturn<NotificationSettings>;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ 
  form, 
  emailEnabled, 
  smsEnabled 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email-notifications">Email Notifications</Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Receive alerts via email
          </p>
        </div>
        <FormField
          control={form.control}
          name="emailEnabled"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {emailEnabled && (
        <div className="ml-6 pl-2 border-l-2 border-muted">
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Email Address</FormLabel>
                <FormDescription className="text-xs">
                  You can use a different email than your login email
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Receive alerts via text message
          </p>
        </div>
        <FormField
          control={form.control}
          name="smsEnabled"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {smsEnabled && (
        <div className="ml-6 pl-2 border-l-2 border-muted">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Phone Number</FormLabel>
                <FormDescription className="text-xs">
                  Enter your number in international format (+123456789)
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationForm;
