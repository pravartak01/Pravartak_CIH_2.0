
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Zap } from 'lucide-react';
import { SolutionTemplate, solutionTemplates } from '@/utils/solutionTemplates';
import { Alert as AlertType } from '@/types';

interface SolutionTemplateSelectorProps {
  alert: AlertType;
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

const SolutionTemplateSelector: React.FC<SolutionTemplateSelectorProps> = ({
  alert,
  selectedTemplate,
  onTemplateSelect,
}) => {
  const getRelevantTemplates = (alert: AlertType): SolutionTemplate[] => {
    return solutionTemplates.filter(template => {
      // Match by system type
      if (alert.system.toLowerCase().includes('web') && template.category === 'web') return true;
      if (alert.system.toLowerCase().includes('database') && template.category === 'database') return true;
      if (alert.system.toLowerCase().includes('system') && template.category === 'system') return true;
      
      // Match by severity
      if (template.severity === alert.severity) return true;
      
      // Default: show high priority templates
      return template.severity === 'high' || template.severity === 'critical';
    });
  };

  const relevantTemplates = getRelevantTemplates(alert);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium">Quick Start Templates</h3>
      </div>
      
      {relevantTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No specific templates found for this vulnerability type.</p>
            <p className="text-sm text-gray-400 mt-1">Custom solutions will be generated based on the alert details.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {relevantTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className={getSeverityColor(template.severity)}>
                    {template.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.steps.length} steps
                  </div>
                </div>

                {selectedTemplate === template.id && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Prerequisites:</h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                      {template.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onTemplateSelect('')}
          disabled={!selectedTemplate}
        >
          Skip Template - Use Custom Solution
        </Button>
      </div>
    </div>
  );
};

export default SolutionTemplateSelector;
