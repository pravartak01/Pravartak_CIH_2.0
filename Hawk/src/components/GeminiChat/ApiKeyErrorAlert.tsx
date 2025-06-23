
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ApiKeyErrorAlert: React.FC = () => {
  return (
    <Alert variant="destructive" className="m-3 mb-0">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        Gemini API key is not configured. Please add GEMINI_API_KEY to Supabase Edge Function secrets.
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeyErrorAlert;
