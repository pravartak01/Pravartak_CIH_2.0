
import React, { useEffect, useState } from 'react';
import { Check, AlertTriangle, XCircle, Clock, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { capitalize } from '../utils/formatters';
import { SystemStatus } from '../types';
import { toast } from "sonner";

const StatusOverview = () => {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get count of systems by status
  const operationalCount = systems.filter(s => s.status === 'operational').length;
  const degradedCount = systems.filter(s => s.status === 'degraded').length;
  const criticalCount = systems.filter(s => s.status === 'critical').length;
  const maintenanceCount = systems.filter(s => s.status === 'maintenance').length;

  const fetchSystems = async () => {
    try {
      const { data: systemsData, error: systemsError } = await supabase
        .from('systems')
        .select('*');

      if (systemsError) throw systemsError;

      // Get alert counts for each system
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('system, severity, status');

      if (alertsError) throw alertsError;

      // Process the data to match our SystemStatus type
      const processedSystems: SystemStatus[] = systemsData.map(system => {
        const systemAlerts = alertsData.filter(alert => alert.system === system.name);
        const alertsCount = systemAlerts.length;
        const highSeverityCount = systemAlerts.filter(
          alert => (alert.severity === 'high' || alert.severity === 'critical') && alert.status !== 'resolved'
        ).length;

        return {
          name: system.name,
          status: system.status as 'operational' | 'degraded' | 'critical' | 'maintenance',
          alertsCount,
          highSeverityCount
        };
      });

      setSystems(processedSystems);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching systems:', error);
      toast.error('Failed to load system status data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSystems();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <Check className="h-5 w-5 text-emerald-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-alert-critical" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-100 text-emerald-800';
      case 'degraded':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-6 animate-fade-in flex justify-center items-center h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">System Status</h2>
        <div className="flex text-xs text-gray-500 items-center">
          <RefreshCw className="h-3 w-3 mr-1" />
          Updated {formatTimeAgo(lastUpdated)}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col items-center rounded-lg bg-green-50 p-3">
          <Check className="h-6 w-6 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-600">Operational</span>
          <span className="font-semibold text-emerald-700">{operationalCount}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-amber-50 p-3">
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-1" />
          <span className="text-xs text-gray-600">Degraded</span>
          <span className="font-semibold text-amber-700">{degradedCount}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-red-50 p-3">
          <XCircle className="h-6 w-6 text-red-500 mb-1" />
          <span className="text-xs text-gray-600">Critical</span>
          <span className="font-semibold text-red-700">{criticalCount}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-blue-50 p-3">
          <Clock className="h-6 w-6 text-blue-500 mb-1" />
          <span className="text-xs text-gray-600">Maintenance</span>
          <span className="font-semibold text-blue-700">{maintenanceCount}</span>
        </div>
      </div>

      <div className="space-y-4">
        {systems.map((system, index) => (
          <div 
            key={system.name} 
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(system.status)}
              <span className="font-medium">{system.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(system.status)}`}>
                {capitalize(system.status)}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">
                  {system.alertsCount} {system.alertsCount === 1 ? 'alert' : 'alerts'}
                </span>
                {system.highSeverityCount > 0 && (
                  <span className="text-xs text-red-600">
                    {system.highSeverityCount} high severity
                  </span>
                )}
              </div>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button 
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>
    </div>
  );
};

export default StatusOverview;
