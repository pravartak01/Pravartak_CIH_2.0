
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../integrations/supabase/client';
import { format } from 'date-fns';

const TrendChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVulnerabilityTrends = async () => {
      try {
        setIsLoading(true);
        const { data: trends, error } = await supabase
          .from('vulnerability_trends')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) throw error;
        
        // Transform the data for the chart
        const formattedData = trends.map(trend => ({
          date: format(new Date(trend.date), 'MMM dd'),
          critical: trend.critical_count,
          high: trend.high_count,
          medium: trend.medium_count,
          low: trend.low_count
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching vulnerability trends:', error);
        setError('Failed to load vulnerability trend data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVulnerabilityTrends();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card p-4 rounded-lg h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-4 rounded-lg h-[300px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-primary hover:text-primary/80 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-lg h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '8px', 
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Legend />
          <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" name="Critical" />
          <Area type="monotone" dataKey="high" stackId="1" stroke="#f87171" fill="#f87171" name="High" />
          <Area type="monotone" dataKey="medium" stackId="1" stroke="#fb923c" fill="#fb923c" name="Medium" />
          <Area type="monotone" dataKey="low" stackId="1" stroke="#38bdf8" fill="#38bdf8" name="Low" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
