
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, Wifi, Server, Database, HardDrive, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const SecurityScannerVisual: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentSystem, setCurrentSystem] = useState(0);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  
  const systems = [
    { name: "Network", icon: <Wifi className="h-4 w-4" /> },
    { name: "Servers", icon: <Server className="h-4 w-4" /> },
    { name: "Databases", icon: <Database className="h-4 w-4" /> },
    { name: "Storage", icon: <HardDrive className="h-4 w-4" /> },
    { name: "Security", icon: <Lock className="h-4 w-4" /> }
  ];

  // Simulated scanning effect
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // When progress completes, move to next system
          setCurrentSystem(current => (current + 1) % systems.length);
          return 0;
        }
        return prev + 1;
      });
    }, 100);
    
    // Add log entries periodically
    const logInterval = setInterval(() => {
      const currentSys = systems[currentSystem].name;
      const actions = [
        `Scanning ${currentSys} components...`,
        `Analyzing ${currentSys} security posture...`,
        `Checking ${currentSys} for vulnerabilities...`,
        `${currentSys} scan complete. No issues found.`,
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setActivityLog(prev => {
        const newLog = [randomAction, ...prev];
        return newLog.slice(0, 5); // Keep only the 5 most recent logs
      });
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [currentSystem, systems]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Real-Time Security Scanner
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
              {systems.map((system, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-center p-2 rounded-md ${
                    index === currentSystem ? 'bg-primary/10 ring-1 ring-primary/30' : ''
                  }`}
                >
                  {system.icon}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Scanning {systems[currentSystem].name}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="border rounded-md bg-muted/20 p-3 h-[140px] overflow-hidden">
            <h4 className="text-sm font-medium mb-2">Scanner Activity Log</h4>
            <div className="space-y-2">
              {activityLog.length > 0 ? (
                activityLog.map((log, index) => (
                  <div 
                    key={index}
                    className={`text-xs text-muted-foreground animate-slide-down`}
                    style={{ 
                      animationDuration: '0.5s',
                      opacity: 1 - (index * 0.15) // Fade out older logs
                    }}
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">Starting scanner...</div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>24/7 Protection</span>
            <div className="flex items-center space-x-1">
              <span>Realtime</span>
              <div className="relative">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-green-500 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityScannerVisual;
