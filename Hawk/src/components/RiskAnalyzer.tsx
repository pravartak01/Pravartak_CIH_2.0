
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader, Shield, AlertTriangle, CircleCheck, PieChart } from 'lucide-react';
import { Alert, Json } from '@/types';

const RiskAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analyzedAlerts, setAnalyzedAlerts] = useState<(Alert & { riskScore: number, falsePositive: boolean })[]>([]);
  const [progress, setProgress] = useState(0);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setProgress(10);
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setProgress(30);
      
      // Transform data to match our Alert type
      const formattedAlerts: Alert[] = data.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        date: alert.date,
        system: alert.system,
        cve: alert.cve || undefined,
        status: alert.status as 'new' | 'acknowledged' | 'resolved',
        mitigation: alert.mitigation || undefined,
        patchLink: alert.patch_link || undefined,
        details: alert.details || undefined,
      }));
      
      setAlerts(formattedAlerts);
      setProgress(50);
      
      toast.success(`Fetched ${formattedAlerts.length} alerts for analysis`);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts for analysis');
    } finally {
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  const analyzeRisks = () => {
    setProgress(10);
    
    // Simulate AI processing with timeouts
    setTimeout(() => {
      setProgress(30);
      
      // Simple mock AI analysis
      const analyzed = alerts.map(alert => {
        // Calculate base risk score from severity
        const severityScores = {
          'low': 2,
          'medium': 5,
          'high': 8,
          'critical': 10
        };
        
        let baseScore = severityScores[alert.severity];
        
        // Factor in exploitability (using mock data)
        const exploitabilityFactor = Math.random() * 2; // 0-2 random factor
        
        // Add impact factor (using system criticality as proxy)
        const systemCriticality = alert.system.includes('Windows') ? 1.5 :
                                alert.system.includes('Linux') ? 1.3 :
                                alert.system.includes('macOS') ? 1.2 : 1;
        
        // Calculate final risk score (0-10 scale)
        let riskScore = Math.min(10, (baseScore + exploitabilityFactor) * systemCriticality / 1.5);
        riskScore = parseFloat(riskScore.toFixed(1));
        
        // Determine if it might be a false positive
        // For this demo, we'll randomly mark some low severity alerts as false positives
        const falsePositive = alert.severity === 'low' && Math.random() < 0.3;
        
        return {
          ...alert,
          riskScore,
          falsePositive
        };
      });
      
      setProgress(70);
      
      // Sort by risk score (highest first)
      analyzed.sort((a, b) => b.riskScore - a.riskScore);
      
      setAnalyzedAlerts(analyzed);
      setProgress(100);
      
      toast.success('Risk analysis completed');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <h2 className="text-xl font-semibold">AI-Powered Risk Analysis</h2>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Fetch Alerts
          </Button>
          
          <Button
            onClick={analyzeRisks}
            disabled={loading || alerts.length === 0}
            className="flex items-center gap-2"
          >
            <PieChart className="h-4 w-4" />
            Analyze Risks
          </Button>
        </div>
      </div>
      
      {loading && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {progress < 100 ? "Processing..." : "Completed"}
          </p>
        </div>
      )}
      
      {analyzedAlerts.length > 0 && (
        <div className="space-y-5">
          <Card className="p-4">
            <h3 className="text-md font-medium mb-2">Analysis Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Critical Risk</p>
                <p className="text-xl font-bold text-red-600">
                  {analyzedAlerts.filter(a => a.riskScore >= 8 && !a.falsePositive).length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">High Risk</p>
                <p className="text-xl font-bold text-orange-600">
                  {analyzedAlerts.filter(a => a.riskScore >= 6 && a.riskScore < 8 && !a.falsePositive).length}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Medium Risk</p>
                <p className="text-xl font-bold text-yellow-600">
                  {analyzedAlerts.filter(a => a.riskScore >= 4 && a.riskScore < 6 && !a.falsePositive).length}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">False Positives</p>
                <p className="text-xl font-bold text-blue-600">
                  {analyzedAlerts.filter(a => a.falsePositive).length}
                </p>
              </div>
            </div>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium">Prioritized Vulnerabilities</h3>
            {analyzedAlerts
              .filter(alert => !alert.falsePositive)
              .map((alert) => (
                <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    </div>
                    <div className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                      alert.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                      alert.riskScore >= 6 ? 'bg-orange-100 text-orange-800' :
                      alert.riskScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.riskScore}/10
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {alert.cve && (
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {alert.cve}
                      </div>
                    )}
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      System: {alert.system}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </div>
                  </div>
                  
                  {alert.mitigation && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium">Mitigation: </span>
                      {alert.mitigation}
                    </div>
                  )}
                </Card>
              ))}
          </div>
          
          {analyzedAlerts.filter(a => a.falsePositive).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-green-600" />
                Filtered False Positives
              </h3>
              {analyzedAlerts
                .filter(alert => alert.falsePositive)
                .map((alert) => (
                  <Card key={alert.id} className="p-4 bg-gray-50 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-600">{alert.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 text-xs font-medium rounded-full">
                        False Positive
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {alert.cve && (
                        <div className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          {alert.cve}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}
      
      {alerts.length > 0 && analyzedAlerts.length === 0 && (
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
          <p className="text-gray-600 mb-4">
            {alerts.length} alerts have been fetched and are ready for AI risk analysis.
          </p>
          <Button onClick={analyzeRisks}>Run Analysis</Button>
        </Card>
      )}
      
      {alerts.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Alerts to Analyze</h3>
          <p className="text-gray-600 mb-4">
            Fetch alerts from the database to begin risk analysis.
          </p>
          <Button variant="outline" onClick={fetchAlerts}>Fetch Alerts</Button>
        </Card>
      )}
    </div>
  );
};

export default RiskAnalyzer;
