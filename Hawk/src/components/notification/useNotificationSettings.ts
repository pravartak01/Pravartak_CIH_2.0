
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationSettings } from './types';
import { useAuth } from '@/hooks/useAuth';

const notificationSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  emailAddress: z.string().email("Please enter a valid email address").or(z.string().length(0)),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number").or(z.string().length(0)),
  alertLevel: z.string().default("critical"),
  frequency: z.string().default("immediate"),
  timeframe: z.string().default("any"),
  emailVerified: z.boolean().optional()
});

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);
  
  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailEnabled: true,
      smsEnabled: false,
      emailAddress: user?.email || '',
      phoneNumber: '',
      alertLevel: 'critical',
      frequency: 'immediate',
      timeframe: 'any',
      emailVerified: true // Default to true for all emails
    }
  });

  const { watch, setValue, reset } = form;
  const emailEnabled = watch('emailEnabled');
  const smsEnabled = watch('smsEnabled');
  const emailAddress = watch('emailAddress');
  
  // Fetch settings on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Auto-verify all emails - skip verification
  useEffect(() => {
    if (emailAddress) {
      setValue('emailVerified', true);
    }
  }, [emailAddress, setValue]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching settings for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_systems')
        .select('monitoring_settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data?.monitoring_settings) {
        console.log("Found settings in database:", data.monitoring_settings);
        const monSettings = typeof data.monitoring_settings === 'string' 
          ? JSON.parse(data.monitoring_settings) 
          : data.monitoring_settings;
        
        if (monSettings.notificationPreferences) {
          console.log("Loaded settings:", monSettings.notificationPreferences);
          reset({
            emailEnabled: monSettings.notificationPreferences.emailEnabled ?? true,
            smsEnabled: monSettings.notificationPreferences.smsEnabled ?? false,
            emailAddress: monSettings.notificationPreferences.emailAddress || user.email || '',
            phoneNumber: monSettings.notificationPreferences.phoneNumber || '',
            alertLevel: monSettings.notificationPreferences.alertLevel || 'critical',
            frequency: monSettings.notificationPreferences.frequency || 'immediate',
            timeframe: monSettings.notificationPreferences.timeframe || 'any',
            emailVerified: true // Always set to true
          });
        }
      } else {
        console.log("No settings found for user, creating defaults");
        await initializeDefaultSettings();
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      toast.error('Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    if (!user) return;
    
    try {
      const defaultSettings = {
        notificationPreferences: {
          emailEnabled: true,
          smsEnabled: false,
          emailAddress: user.email,
          phoneNumber: '',
          alertLevel: 'critical',
          frequency: 'immediate',
          timeframe: 'any',
          emailVerified: true
        }
      };
      
      const { error } = await supabase
        .from('user_systems')
        .insert({
          user_id: user.id,
          system_name: 'Default System',
          monitoring_settings: defaultSettings
        });
        
      if (error) throw error;
      
      reset({
        emailEnabled: true,
        smsEnabled: false,
        emailAddress: user.email || '',
        phoneNumber: '',
        alertLevel: 'critical',
        frequency: 'immediate',
        timeframe: 'any',
        emailVerified: true
      });
    } catch (err) {
      console.error('Error initializing default settings:', err);
    }
  };

  const handleSaveSettings = async (values: NotificationSettings) => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Saving notification settings:", values);
      
      // Always set email as verified
      values.emailVerified = true;
      
      const { data: existingSystem, error: fetchError } = await supabase
        .from('user_systems')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current settings:', fetchError);
        throw fetchError;
      }
      
      const notificationPreferences = {
        emailEnabled: values.emailEnabled,
        smsEnabled: values.smsEnabled,
        emailAddress: values.emailAddress,
        phoneNumber: values.phoneNumber,
        alertLevel: values.alertLevel,
        frequency: values.frequency,
        timeframe: values.timeframe,
        emailVerified: true // Always set as verified
      };
      
      // Fix: Make sure monitoringSettings is always an object
      let monitoringSettings: Record<string, any> = {};
      
      if (existingSystem?.monitoring_settings) {
        // Get the existing monitoring_settings and parse it if necessary
        if (typeof existingSystem.monitoring_settings === 'string') {
          monitoringSettings = JSON.parse(existingSystem.monitoring_settings);
        } else if (existingSystem.monitoring_settings !== null && typeof existingSystem.monitoring_settings === 'object') {
          // Safe spread of object
          monitoringSettings = { ...existingSystem.monitoring_settings };
        }
      }
      
      // Update only the notificationPreferences part while preserving other settings
      monitoringSettings = {
        ...monitoringSettings,
        notificationPreferences
      };
      
      console.log("Saving monitoring settings:", monitoringSettings);
      
      // Initialize or create user_system record
      if (!existingSystem) {
        console.log("Creating new user_system record");
        const { error: insertError } = await supabase
          .from('user_systems')
          .insert({
            user_id: user.id,
            system_name: 'Default System',
            monitoring_settings: monitoringSettings
          });
          
        if (insertError) throw insertError;
      } else {
        console.log("Updating existing user_system record");
        const { error: updateError } = await supabase
          .from('user_systems')
          .update({ 
            monitoring_settings: monitoringSettings
          })
          .eq('id', existingSystem.id);
          
        if (updateError) throw updateError;
      }
      
      // No need to send verification emails
      setEmailVerificationSent(false);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
      setDebug(`Save error: ${JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    saveSuccess,
    emailVerificationSent,
    debug,
    setDebug,
    emailEnabled,
    smsEnabled,
    handleSaveSettings,
    fetchSettings
  };
};
