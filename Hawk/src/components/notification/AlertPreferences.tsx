
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { NotificationSettings } from './types';

interface AlertPreferencesProps {
  form: UseFormReturn<NotificationSettings>;
}

const AlertPreferences: React.FC<AlertPreferencesProps> = ({ form }) => {
  return (
    <div className="space-y-4 pt-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Alert Preferences
      </h3>
      
      <FormField
        control={form.control}
        name="alertLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Alert Level</FormLabel>
            <FormControl>
              <RadioGroup 
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-1 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="alert-critical" />
                  <Label htmlFor="alert-critical" className="text-sm font-normal">Critical vulnerabilities only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="alert-high" />
                  <Label htmlFor="alert-high" className="text-sm font-normal">High and critical vulnerabilities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="alert-all" />
                  <Label htmlFor="alert-all" className="text-sm font-normal">All vulnerabilities</Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Notification Frequency</FormLabel>
              <Select 
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger id="alert-frequency" className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly digest</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                  <SelectItem value="weekly">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="timeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Notification Timeframe</FormLabel>
              <Select 
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger id="alert-timeframe" className="mt-1">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="business">Business hours only (9AM-5PM)</SelectItem>
                  <SelectItem value="custom">Custom schedule</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AlertPreferences;
