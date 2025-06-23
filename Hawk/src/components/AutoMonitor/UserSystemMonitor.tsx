import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader, RefreshCw, Clock, AlertTriangle, Settings } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { UserSystem, MonitoringSettings, Json } from '@/types';

const UserSystemMonitor: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MonitoringSettings>({
    autoScanEnabled: false,
    scanInterval: 24,
    criticalOnly: false,
    lastScanTime: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nextScanTime, setNextScanTime] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const verifyConnection = async () => {
      const { success, error } = await checkSupabaseConnection();
      if (!success) {
        setConnectionError(error || 'Failed to connect to database');
        toast.error('Database connection error. Please try again later.');
      } else {
        setConnectionError(null);
      }
    };
    
    verifyConnection();
  }, []);

  useEffect(() => {
    if (!user || connectionError) return;
    
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_systems')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          const userSystem = data as UserSystem;
          const monitorSettings = userSystem.monitoring_settings || {};
          
          setSettings({
            autoScanEnabled: Boolean(monitorSettings.autoScanEnabled),
            scanInterval: typeof monitorSettings.scanInterval === 'number' ? monitorSettings.scanInterval : 24,
            criticalOnly: Boolean(monitorSettings.criticalOnly),
            lastScanTime: monitorSettings.lastScanTime || null
          });
          
          if (monitorSettings.autoScanEnabled && monitorSettings.lastScanTime) {
            const lastScan = new Date(monitorSettings.lastScanTime);
            const nextScan = new Date(lastScan);
            nextScan.setHours(nextScan.getHours() + (typeof monitorSettings.scanInterval === 'number' ? monitorSettings.scanInterval : 24));
            setNextScanTime(nextScan);
          }
        }
      } catch (error) {
        console.error('Error loading monitoring settings:', error);
        toast.error('Failed to load monitoring settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, connectionError]);

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const monitoringSettings: MonitoringSettings = {
        autoScanEnabled: settings.autoScanEnabled,
        scanInterval: settings.scanInterval,
        criticalOnly: settings.criticalOnly,
        lastScanTime: settings.lastScanTime
      };
      
      const { data, error } = await supabase
        .from('user_systems')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        await supabase
          .from('user_systems')
          .update({ 
            monitoring_settings: monitoringSettings,
            system_name: 'Auto Monitor'
          })
          .eq('id', data.id);
      } else {
        await supabase
          .from('user_systems')
          .insert([{ 
            user_id: user.id, 
            system_name: 'Auto Monitor',
            monitoring_settings: monitoringSettings
          }]);
      }
      
      if (settings.autoScanEnabled) {
        const now = new Date();
        const nextScan = new Date(now);
        nextScan.setHours(nextScan.getHours() + settings.scanInterval!);
        setNextScanTime(nextScan);
      } else {
        setNextScanTime(null);
      }
      
      toast.success('Monitoring settings saved');
    } catch (error) {
      console.error('Error saving monitoring settings:', error);
      toast.error('Failed to save monitoring settings');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerManualScan = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('real-time-scraper', {
        body: { 
          source: settings.criticalOnly ? 'critical' : 'all',
          userId: user.id
        }
      });

      if (error) throw error;
      
      const now = new Date();
      setSettings(prev => ({
        ...prev,
        lastScanTime: now.toISOString()
      }));
      
      if (settings.autoScanEnabled) {
        const nextScan = new Date(now);
        nextScan.setHours(nextScan.getHours() + (settings.scanInterval || 24));
        setNextScanTime(nextScan);
      }
      
      saveSettings();
      
      toast.success(`Scan completed: ${data.count} vulnerabilities found`);
    } catch (error) {
      console.error('Error running manual scan:', error);
      toast.error('Failed to run vulnerability scan');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoScan = () => {
    setSettings(prev => ({
      ...prev,
      autoScanEnabled: !prev.autoScanEnabled
    }));
  };

  const toggleCriticalOnly = () => {
    setSettings(prev => ({
      ...prev,
      criticalOnly: !prev.criticalOnly
    }));
  };

  const updateScanInterval = (hours: number) => {
    setSettings(prev => ({
      ...prev,
      scanInterval: hours
    }));
  };

  if (connectionError) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Automatic Vulnerability Monitoring</CardTitle>
          <CardDescription>Database connection issue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Database Connection Error</h3>
            <p className="text-muted-foreground mb-4">
              Unable to connect to the database. Please try again later.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Automatic Vulnerability Monitoring</CardTitle>
            <CardDescription>Configure automatic scanning for new vulnerabilities</CardDescription>
          </div>
          {settings.autoScanEnabled && nextScanTime && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next scan: {nextScanTime.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-scan">Automatic Scanning</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically scan for new vulnerabilities on a schedule
                  </p>
                </div>
                <Switch
                  id="auto-scan"
                  checked={settings.autoScanEnabled}
                  onCheckedChange={toggleAutoScan}
                />
              </div>
              
              {settings.autoScanEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Scan Frequency</Label>
                    <div className="flex space-x-2">
                      {[6, 12, 24, 48].map((hours) => (
                        <Button
                          key={hours}
                          variant={settings.scanInterval === hours ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateScanInterval(hours)}
                        >
                          {hours} hours
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="critical-only">Critical Vulnerabilities Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Only scan for critical severity vulnerabilities
                      </p>
                    </div>
                    <Switch
                      id="critical-only"
                      checked={settings.criticalOnly}
                      onCheckedChange={toggleCriticalOnly}
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={saveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={triggerManualScan}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Scan Now
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {settings.lastScanTime && (
              <div className="pt-4 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Last scan: {new Date(settings.lastScanTime).toLocaleString()}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSystemMonitor;
