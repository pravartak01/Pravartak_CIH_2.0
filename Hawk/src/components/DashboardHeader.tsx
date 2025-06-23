
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { AlertsStats } from '../types';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const [stats, setStats] = useState<AlertsStats>({
    total: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    resolved: 0,
    new: 0,
    acknowledged: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all alerts to calculate statistics
        const { data: alerts, error } = await supabase
          .from('alerts')
          .select('severity, status');
        
        if (error) throw error;
        
        if (alerts) {
          const total = alerts.length;
          const critical = alerts.filter(a => a.severity === 'critical').length;
          const high = alerts.filter(a => a.severity === 'high').length;
          const medium = alerts.filter(a => a.severity === 'medium').length;
          const low = alerts.filter(a => a.severity === 'low').length;
          const resolved = alerts.filter(a => a.status === 'resolved').length;
          const newAlerts = alerts.filter(a => a.status === 'new').length;
          const acknowledged = alerts.filter(a => a.status === 'acknowledged').length;
          
          setStats({
            total,
            bySeverity: { critical, high, medium, low },
            resolved,
            new: newAlerts,
            acknowledged,
          });
        }
      } catch (error) {
        console.error('Error fetching alert statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <div className="animate-fade-in mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 rounded-lg animate-pulse">
              <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const { total, bySeverity, resolved, new: newAlerts, acknowledged } = stats;
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 rounded-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Alerts</p>
              <p className="text-3xl font-semibold">{total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Critical</div>
              <div className="text-lg font-medium text-alert-critical">{bySeverity.critical}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">High</div>
              <div className="text-lg font-medium text-alert-high">{bySeverity.high}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Medium</div>
              <div className="text-lg font-medium text-alert-medium">{bySeverity.medium}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Low</div>
              <div className="text-lg font-medium text-alert-low">{bySeverity.low}</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5 rounded-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">New Alerts</p>
              <p className="text-3xl font-semibold">{newAlerts}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-alert-high" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-alert-high h-2.5 rounded-full"
                style={{ width: `${Math.min(100, (newAlerts / total) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0</span>
              <span>{total}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5 rounded-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Alert Status</p>
              <p className="text-3xl font-semibold">{resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-alert-critical"></div>
                <span className="text-sm">{newAlerts} New</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <span className="text-sm">{acknowledged} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                <span className="text-sm">{resolved} Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
