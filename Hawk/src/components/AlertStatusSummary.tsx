
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AlertStatusSummaryProps {
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const AlertStatusSummary: React.FC<AlertStatusSummaryProps> = ({ severityCounts }) => {
  const totalAlerts = severityCounts.critical + severityCounts.high + severityCounts.medium + severityCounts.low;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Security Alert Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-4">
          <AlertTile 
            title="Critical" 
            count={severityCounts.critical} 
            color="bg-red-500" 
            bgColor="bg-red-50"
            textColor="text-red-700"
            borderColor="border-red-100"
          />
          
          <AlertTile 
            title="High" 
            count={severityCounts.high} 
            color="bg-orange-500" 
            bgColor="bg-orange-50"
            textColor="text-orange-700"
            borderColor="border-orange-100"
          />
          
          <AlertTile 
            title="Medium" 
            count={severityCounts.medium} 
            color="bg-amber-500" 
            bgColor="bg-amber-50"
            textColor="text-amber-700"
            borderColor="border-amber-100"
          />
          
          <AlertTile 
            title="Low" 
            count={severityCounts.low} 
            color="bg-blue-500" 
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-100"
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            {totalAlerts === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span>All systems secure</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{totalAlerts} alerts require attention</span>
              </div>
            )}
          </div>
          
          <Link to="/alerts">
            <Button size="sm" variant={totalAlerts > 0 ? "default" : "outline"}>
              View Alerts
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

interface AlertTileProps {
  title: string;
  count: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const AlertTile: React.FC<AlertTileProps> = ({ 
  title, 
  count, 
  color, 
  bgColor,
  textColor,
  borderColor
}) => {
  return (
    <div className={`flex flex-col p-3 ${bgColor} border ${borderColor} rounded-lg transition-all hover:shadow-md`}>
      <span className={`text-sm font-medium ${textColor}`}>{title}</span>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-2xl font-bold ${textColor}`}>{count}</span>
        <div className="relative">
          <div className={`h-2 w-2 rounded-full ${color}`}></div>
          {count > 0 && (
            <div className={`absolute inset-0 h-2 w-2 rounded-full ${color} animate-ping`}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertStatusSummary;
