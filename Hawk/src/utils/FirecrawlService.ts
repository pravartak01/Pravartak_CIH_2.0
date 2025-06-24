
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CrawlResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export class FirecrawlService {
  /**
   * Scan an OEM website for potential vulnerabilities and product information
   * @param url The URL to scan
   * @param name The name of the OEM source
   * @param systemType The type of system this OEM produces
   */
  static async scanOEMWebsite(url: string, name: string, systemType: string): Promise<CrawlResponse> {
    try {
      console.log(`Starting OEM scan for ${name} at ${url}`);
      
      // Call the test-oem-scraper edge function
      const response = await supabase.functions.invoke('test-oem-scraper', {
        body: { 
          url, 
          name, 
          system_type: systemType 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to scan OEM website');
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error scanning OEM website:', error);
      toast.error('Failed to scan OEM website');
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Auto-detect potential OEM websites based on system type
   * @param systemType The type of system to find OEMs for
   */
  static async detectOEMWebsites(systemType: string): Promise<CrawlResponse> {
    try {
      // Call the detect-oem-websites edge function
      const response = await supabase.functions.invoke('real-time-scraper', {
        body: { 
          action: 'detect_oems',
          systemType 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to detect OEM websites');
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error detecting OEM websites:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
