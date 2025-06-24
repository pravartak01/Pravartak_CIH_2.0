
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://eogwxywiidsnnlaybbdd.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ3d4eXdpaWRzbm5sYXliYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODAwOTAsImV4cCI6MjA1Njg1NjA5MH0.hfDAUf0FFv8OI2t5oCw-PksoLBgz3r792nkMpTAuwC4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper Types for concise data operations
export interface VulnerabilityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface SystemStatus {
  operational: number;
  degraded: number;
  critical: number;
  maintenance: number;
}

// Add a helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('systems').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Helper function to create the notifications table if it doesn't exist
export const ensureNotificationsTable = async () => {
  try {
    // Try to call the create_notifications_table RPC function
    const { error } = await supabase.rpc('create_notifications_table' as any);
    
    if (error) {
      console.error('Error creating notifications table:', error);
      // Call the edge function as a fallback
      try {
        await supabase.functions.invoke('database-functions');
      } catch (fnError) {
        console.error('Error calling database-functions edge function:', fnError);
      }
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error ensuring notifications table exists:', err);
    
    // Call the edge function as a fallback
    try {
      await supabase.functions.invoke('database-functions');
    } catch (fnError) {
      console.error('Error calling database-functions edge function:', fnError);
    }
    
    return false;
  }
};

// Get vulnerability statistics - concise solution
export const getVulnerabilityStats = async (): Promise<VulnerabilityStats> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('severity')
      .in('status', ['new', 'acknowledged']);
      
    if (error) throw error;
    
    const stats: VulnerabilityStats = {
      critical: data.filter(alert => alert.severity === 'critical').length,
      high: data.filter(alert => alert.severity === 'high').length,
      medium: data.filter(alert => alert.severity === 'medium').length,
      low: data.filter(alert => alert.severity === 'low').length,
      total: data.length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching vulnerability stats:', error);
    return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  }
};

// Get system statuses - concise solution
export const getSystemStatuses = async (): Promise<SystemStatus> => {
  try {
    const { data, error } = await supabase
      .from('systems')
      .select('status');
      
    if (error) throw error;
    
    const statuses: SystemStatus = {
      operational: data.filter(system => system.status === 'operational').length,
      degraded: data.filter(system => system.status === 'degraded').length,
      critical: data.filter(system => system.status === 'critical').length,
      maintenance: data.filter(system => system.status === 'maintenance').length
    };
    
    return statuses;
  } catch (error) {
    console.error('Error fetching system statuses:', error);
    return { operational: 0, degraded: 0, critical: 0, maintenance: 0 };
  }
};

// Get specific vulnerability details with a concise solution
export const getVulnerabilityDetails = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Add CVE link if available (without modifying the original data type)
    const result = {
      ...data,
      // Provide the CVE link separately without modifying the actual data
      cveInfo: data.cve ? {
        cveLink: `https://nvd.nist.gov/vuln/detail/${data.cve}`
      } : null
    };
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching vulnerability details:', error);
    return { success: false, error: 'Unable to retrieve vulnerability details' };
  }
};

// Initialize the notifications table when the client is loaded
ensureNotificationsTable().then(success => {
  if (success) {
    console.log('Notifications table is ready');
  }
}).catch(err => {
  console.error('Error initializing notifications:', err);
});
