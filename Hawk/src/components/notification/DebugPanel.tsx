
import React from 'react';
import { Info } from 'lucide-react';

interface DebugPanelProps {
  debug: string | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ debug }) => {
  if (!debug) return null;
  
  return (
    <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Info className="h-4 w-4" />
        <span>Debug Info:</span>
      </div>
      <pre className="text-xs mt-2 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
        {debug}
      </pre>
    </div>
  );
};

export default DebugPanel;
