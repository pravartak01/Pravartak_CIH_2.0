
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { OEMSource } from '@/types';

export const fetchUserOEMSources = async (userId: string): Promise<OEMSource[]> => {
  try {
    const { data, error } = await supabase
      .from('oem_sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data as OEMSource[];
  } catch (error) {
    console.error('Error fetching OEM sources:', error);
    toast.error('Failed to load OEM sources');
    return [];
  }
};

export const addOEMSource = async (
  userId: string,
  name: string,
  url: string,
  systemType: string
): Promise<OEMSource | null> => {
  try {
    // Ensure URL has http:// or https:// prefix
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`; 
    
    const { data, error } = await supabase
      .from('oem_sources')
      .insert({
        user_id: userId,
        name: name,
        url: normalizedUrl,
        system_type: systemType,
        is_active: true
      })
      .select('*')
      .single();

    if (error) throw error;
    
    toast.success('OEM source added successfully');
    return data as OEMSource;
  } catch (error) {
    console.error('Error adding OEM source:', error);
    toast.error('Failed to add OEM source');
    return null;
  }
};

export const updateOEMSource = async (
  sourceId: string,
  updates: Partial<OEMSource>
): Promise<boolean> => {
  try {
    // If url is being updated, ensure it has http:// or https:// prefix
    if (updates.url && !updates.url.startsWith('http')) {
      updates.url = `https://${updates.url}`;
    }
    
    const { error } = await supabase
      .from('oem_sources')
      .update(updates)
      .eq('id', sourceId);

    if (error) throw error;
    
    toast.success('OEM source updated');
    return true;
  } catch (error) {
    console.error('Error updating OEM source:', error);
    toast.error('Failed to update OEM source');
    return false;
  }
};

export const deleteOEMSource = async (sourceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('oem_sources')
      .delete()
      .eq('id', sourceId);

    if (error) throw error;
    
    toast.success('OEM source deleted');
    return true;
  } catch (error) {
    console.error('Error deleting OEM source:', error);
    toast.error('Failed to delete OEM source');
    return false;
  }
};

export const testOEMSource = async (source: OEMSource): Promise<boolean> => {
  try {
    // Call Edge Function to test the OEM source
    const { data, error } = await supabase.functions.invoke('test-oem-scraper', {
      body: {
        url: source.url,
        name: source.name,
        system_type: source.system_type
      }
    });
    
    if (error) throw error;
    
    if (data.success) {
      toast.success(`Test successful: Found ${data.vulnerabilitiesCount || 0} potential vulnerabilities`);
      return true;
    } else {
      toast.error(`Test failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error('Error testing OEM source:', error);
    toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

// New function to search for OEM vulnerabilities
export const searchOEMVulnerabilities = async (oemName: string): Promise<any[]> => {
  try {
    // This would typically query a real vulnerability database
    // For now, we'll simulate results with the real-time-scraper
    const { data, error } = await supabase.functions.invoke('real-time-scraper', {
      body: { 
        query: oemName,
        limit: 5 
      }
    });
    
    if (error) throw error;
    
    return data.results || [];
  } catch (error) {
    console.error('Error searching OEM vulnerabilities:', error);
    toast.error('Failed to search for vulnerabilities');
    return [];
  }
};
