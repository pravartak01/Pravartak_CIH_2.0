
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Plus, X, Save, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  severity: string;
  system?: string;
  enabled: boolean;
  actions: string[];
}

interface UserMonitoringSettings {
  lastScanTime?: string;
  scanInterval?: number;
  criticalOnly?: boolean;
  autoScanEnabled?: boolean;
  notificationRules?: NotificationRule[];
  [key: string]: any;
}

const NotificationRules: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load rules from user settings
  useEffect(() => {
    if (user) {
      loadRules();
    }
  }, [user]);

  const loadRules = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_systems')
        .select('monitoring_settings')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      const settings = data?.monitoring_settings as UserMonitoringSettings | null;
      
      if (settings?.notificationRules) {
        setRules(settings.notificationRules);
      } else {
        // Initialize with default rules if none exist
        setRules([
          {
            id: crypto.randomUUID(),
            name: 'Critical vulnerabilities',
            condition: 'severity',
            severity: 'critical',
            enabled: true,
            actions: ['email', 'notification']
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading notification rules:', err);
      toast.error('Failed to load notification rules');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRules = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get current settings
      const { data, error } = await supabase
        .from('user_systems')
        .select('monitoring_settings')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      const currentSettings = (data?.monitoring_settings || {}) as UserMonitoringSettings;
      const updatedSettings: UserMonitoringSettings = {
        ...currentSettings,
        notificationRules: rules
      };
      
      // Update settings
      const { error: updateError } = await supabase
        .from('user_systems')
        .update({ monitoring_settings: updatedSettings })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success('Notification rules saved');
    } catch (err) {
      console.error('Error saving notification rules:', err);
      toast.error('Failed to save notification rules');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewRule = () => {
    setEditingRule({
      id: crypto.randomUUID(),
      name: '',
      condition: 'severity',
      severity: 'high',
      enabled: true,
      actions: ['notification']
    });
    setIsCreating(true);
  };

  const saveRule = () => {
    if (!editingRule) return;
    
    if (isCreating) {
      setRules([...rules, editingRule]);
    } else {
      setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
    }
    
    setEditingRule(null);
    setIsCreating(false);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const updateRuleAction = (action: string) => {
    if (!editingRule) return;
    
    const actions = editingRule.actions.includes(action)
      ? editingRule.actions.filter(a => a !== action)
      : [...editingRule.actions, action];
      
    setEditingRule({ ...editingRule, actions });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Custom Notification Rules</CardTitle>
          </div>
          <Button size="sm" onClick={addNewRule} disabled={isLoading || !!editingRule}>
            <Plus className="h-4 w-4 mr-1" /> Add Rule
          </Button>
        </div>
        <CardDescription>
          Create custom rules to determine when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading rules...</div>
        ) : (
          <div className="space-y-4">
            {rules.length === 0 && !editingRule && (
              <div className="text-center py-4 text-muted-foreground">
                No notification rules defined. Click "Add Rule" to create one.
              </div>
            )}
            
            {editingRule && (
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{isCreating ? 'Create New Rule' : 'Edit Rule'}</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setEditingRule(null);
                      setIsCreating(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input 
                      id="rule-name"
                      value={editingRule.name}
                      onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                      placeholder="e.g., Critical Security Alerts"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="condition">Condition Type</Label>
                    <Select 
                      value={editingRule.condition} 
                      onValueChange={(value) => setEditingRule({ ...editingRule, condition: value })}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="severity">Vulnerability Severity</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="cve">CVE Identifier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editingRule.condition === 'severity' && (
                    <div>
                      <Label htmlFor="severity">Severity Level</Label>
                      <Select 
                        value={editingRule.severity} 
                        onValueChange={(value) => setEditingRule({ ...editingRule, severity: value })}
                      >
                        <SelectTrigger id="severity">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {editingRule.condition === 'system' && (
                    <div>
                      <Label htmlFor="system">System Name</Label>
                      <Input 
                        id="system"
                        value={editingRule.system || ''}
                        onChange={(e) => setEditingRule({ ...editingRule, system: e.target.value })}
                        placeholder="e.g., Production Server"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label className="block mb-2">Notification Actions</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={editingRule.actions.includes('notification') ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => updateRuleAction('notification')}
                      >
                        App Notification
                      </Badge>
                      <Badge 
                        variant={editingRule.actions.includes('email') ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => updateRuleAction('email')}
                      >
                        Email
                      </Badge>
                      <Badge 
                        variant={editingRule.actions.includes('sms') ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => updateRuleAction('sms')}
                      >
                        SMS
                      </Badge>
                    </div>
                  </div>
                
                  <Button onClick={saveRule} className="w-full mt-2">
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Create Rule' : 'Update Rule'}
                  </Button>
                </div>
              </div>
            )}
            
            {rules.map(rule => (
              <div 
                key={rule.id} 
                className={`flex items-center justify-between border rounded-md p-3 ${
                  rule.enabled ? 'border-border' : 'border-muted bg-muted/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className={`font-medium ${!rule.enabled && 'text-muted-foreground'}`}>
                      {rule.name || 'Unnamed Rule'}
                    </h3>
                  </div>
                  
                  <div className="mt-1 text-sm text-muted-foreground flex flex-wrap gap-1">
                    {rule.condition === 'severity' && (
                      <span>Alert on {rule.severity} severity</span>
                    )}
                    {rule.condition === 'system' && rule.system && (
                      <span>For system: {rule.system}</span>
                    )}
                    <span className="mx-1">•</span>
                    <span>Actions: {rule.actions.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setEditingRule(rule)}
                    disabled={!!editingRule}
                  >
                    <span className="sr-only">Edit</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteRule(rule.id)}
                    disabled={!!editingRule}
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </Button>
                </div>
              </div>
            ))}
            
            {rules.length > 0 && !editingRule && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={saveRules}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save All Rules
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationRules;
