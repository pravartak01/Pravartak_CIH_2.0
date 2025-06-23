import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  ExternalLink,
  Clock,
  Users,
  Terminal,
  Shield,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Alert as AlertType } from '@/types';
import { useSolutionProgress } from '@/hooks/useSolutionProgress';
import { getSolutionTemplate } from '@/utils/solutionTemplates';
import SolutionTemplateSelector from './SolutionTemplateSelector';

interface SolutionProviderProps {
  alert: AlertType;
}

interface SolutionStep {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  timeEstimate: string;
  category: 'immediate' | 'configuration' | 'patch' | 'monitoring';
  commands?: string[];
  links?: { title: string; url: string }[];
  prerequisites?: string[];
}

const SolutionProvider: React.FC<SolutionProviderProps> = ({ alert }) => {
  const { 
    completedSteps, 
    selectedTemplate, 
    toggleStepCompletion, 
    updateTemplate,
    resetProgress,
    getProgressPercentage 
  } = useSolutionProgress(alert.id);
  
  const [activeTab, setActiveTab] = useState('templates');
  const [showCustomSolutions, setShowCustomSolutions] = useState(false);

  const generateSolutions = (alert: AlertType): SolutionStep[] => {
    const solutions: SolutionStep[] = [];
    
    // Quick fixes based on CVE patterns
    if (alert.cve && alert.cve.includes('2024')) {
      solutions.push({
        id: 1,
        title: 'Apply Latest Security Patch',
        description: `Download and install the official security patch for ${alert.cve}. This addresses the core vulnerability.`,
        difficulty: 'easy',
        timeEstimate: '15-30 minutes',
        category: 'patch',
        links: alert.patchLink ? [{ title: 'Official Patch', url: alert.patchLink }] : [],
        prerequisites: ['Administrative access', 'Backup of current system']
      });
    }

    // System-specific solutions
    if (alert.system.toLowerCase().includes('web')) {
      solutions.push(
        {
          id: 2,
          title: 'Configure Web Application Firewall',
          description: 'Set up WAF rules to block malicious requests targeting this vulnerability.',
          difficulty: 'medium',
          timeEstimate: '1-2 hours',
          category: 'configuration',
          commands: [
            'sudo ufw enable',
            'sudo ufw deny from suspicious_ip',
            'Configure rate limiting rules'
          ]
        },
        {
          id: 3,
          title: 'Update Web Server Configuration',
          description: 'Modify server settings to mitigate the vulnerability impact.',
          difficulty: 'medium',
          timeEstimate: '30-60 minutes',
          category: 'configuration',
          commands: [
            'Edit server configuration file',
            'Add security headers',
            'Restart web server'
          ]
        }
      );
    }

    if (alert.system.toLowerCase().includes('database')) {
      solutions.push({
        id: 4,
        title: 'Secure Database Configuration',
        description: 'Implement database security best practices to prevent exploitation.',
        difficulty: 'advanced',
        timeEstimate: '2-4 hours',
        category: 'configuration',
        commands: [
          'Review user permissions',
          'Enable database auditing',
          'Configure encrypted connections'
        ],
        prerequisites: ['Database administrator access', 'Understanding of SQL']
      });
    }

    // Severity-based immediate actions
    if (alert.severity === 'critical') {
      solutions.unshift({
        id: 0,
        title: 'Immediate Isolation',
        description: 'Temporarily isolate affected systems to prevent further exploitation.',
        difficulty: 'easy',
        timeEstimate: '5-10 minutes',
        category: 'immediate',
        commands: [
          'Disconnect system from network',
          'Document current state',
          'Notify security team'
        ]
      });
    }

    // Monitoring solutions
    solutions.push({
      id: 5,
      title: 'Implement Continuous Monitoring',
      description: 'Set up monitoring to detect future exploitation attempts.',
      difficulty: 'medium',
      timeEstimate: '1-3 hours',
      category: 'monitoring',
      commands: [
        'Configure log monitoring',
        'Set up alerting rules',
        'Test monitoring system'
      ]
    });

    return solutions;
  };

  const handleTemplateSelect = (templateId: string) => {
    updateTemplate(templateId);
    if (templateId) {
      setShowCustomSolutions(true);
      setActiveTab('quick');
    }
  };

  const getTemplateSolutions = (): SolutionStep[] => {
    if (!selectedTemplate) return [];
    
    const template = getSolutionTemplate(selectedTemplate);
    if (!template) return [];
    
    return template.steps.map(step => ({
      ...step,
      timeEstimate: step.difficulty === 'easy' ? '15-30 min' : 
                   step.difficulty === 'medium' ? '30-60 min' : '1-2 hours',
      commands: step.commands || [],
      links: [],
      prerequisites: []
    }));
  };

  const solutions = showCustomSolutions ? 
    (selectedTemplate ? getTemplateSolutions() : generateSolutions(alert)) : 
    [];
    
  const quickFixes = solutions.filter(s => s.category === 'immediate' || s.category === 'patch');
  const comprehensiveSolutions = solutions.filter(s => s.category === 'configuration' || s.category === 'monitoring');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'patch': return <Download className="h-4 w-4 text-blue-500" />;
      case 'configuration': return <Terminal className="h-4 w-4 text-orange-500" />;
      case 'monitoring': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const SolutionCard = ({ solution }: { solution: SolutionStep }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getCategoryIcon(solution.category)}
            <div>
              <CardTitle className="text-lg">{solution.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getDifficultyColor(solution.difficulty)}>
                  {solution.difficulty}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {solution.timeEstimate}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant={completedSteps.includes(solution.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleStepCompletion(solution.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {completedSteps.includes(solution.id) ? 'Completed' : 'Mark Done'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{solution.description}</p>
        
        {solution.prerequisites && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Prerequisites
            </h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {solution.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {solution.commands && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Terminal className="h-4 w-4 mr-1" />
              Commands
            </h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md text-sm font-mono">
              {solution.commands.map((command, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">$ </span>
                  {command}
                </div>
              ))}
            </div>
          </div>
        )}

        {solution.links && solution.links.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Helpful Resources</h4>
            <div className="space-y-1">
              {solution.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Solution Center - {alert.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Choose a solution template or get custom solutions for <strong>{alert.cve || 'this vulnerability'}</strong> affecting your <strong>{alert.system}</strong> system.
            </AlertDescription>
          </Alert>

          {showCustomSolutions && (
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Progress: {completedSteps.length} of {solutions.length} steps completed</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(solutions.length)}%` }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetProgress}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center gap-2" disabled={!showCustomSolutions}>
            <AlertTriangle className="h-4 w-4" />
            Quick Fixes ({quickFixes.length})
          </TabsTrigger>
          <TabsTrigger value="comprehensive" className="flex items-center gap-2" disabled={!showCustomSolutions}>
            <Shield className="h-4 w-4" />
            Comprehensive ({comprehensiveSolutions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <SolutionTemplateSelector
            alert={alert}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        </TabsContent>

        <TabsContent value="quick" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Immediate Actions & Quick Fixes</h3>
              {selectedTemplate && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Using Template: {getSolutionTemplate(selectedTemplate)?.name}
                </Badge>
              )}
            </div>
            {quickFixes.map(solution => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comprehensive" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Long-term Security Improvements</h3>
              {selectedTemplate && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Using Template: {getSolutionTemplate(selectedTemplate)?.name}
                </Badge>
              )}
            </div>
            {comprehensiveSolutions.map(solution => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolutionProvider;
