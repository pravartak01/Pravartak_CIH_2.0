
export interface SolutionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'database' | 'system' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  prerequisites: string[];
  steps: {
    id: number;
    title: string;
    description: string;
    commands?: string[];
    difficulty: 'easy' | 'medium' | 'advanced';
    category: 'immediate' | 'configuration' | 'patch' | 'monitoring';
  }[];
}

export const solutionTemplates: SolutionTemplate[] = [
  {
    id: 'web-xss-mitigation',
    name: 'Cross-Site Scripting (XSS) Mitigation',
    description: 'Complete solution for preventing XSS attacks in web applications',
    category: 'web',
    severity: 'high',
    estimatedTime: '2-4 hours',
    prerequisites: ['Web server admin access', 'Basic understanding of HTTP headers'],
    steps: [
      {
        id: 1,
        title: 'Implement Content Security Policy',
        description: 'Configure CSP headers to prevent script injection',
        commands: [
          "# Add to web server config",
          "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'"
        ],
        difficulty: 'medium',
        category: 'configuration'
      },
      {
        id: 2,
        title: 'Enable XSS Protection Headers',
        description: 'Add security headers to prevent XSS attacks',
        commands: [
          "X-XSS-Protection: 1; mode=block",
          "X-Content-Type-Options: nosniff",
          "X-Frame-Options: DENY"
        ],
        difficulty: 'easy',
        category: 'configuration'
      },
      {
        id: 3,
        title: 'Input Validation and Sanitization',
        description: 'Implement proper input validation on all user inputs',
        difficulty: 'advanced',
        category: 'patch'
      }
    ]
  },
  {
    id: 'sql-injection-prevention',
    name: 'SQL Injection Prevention',
    description: 'Comprehensive protection against SQL injection attacks',
    category: 'database',
    severity: 'critical',
    estimatedTime: '3-6 hours',
    prerequisites: ['Database admin access', 'Application code access'],
    steps: [
      {
        id: 1,
        title: 'Use Parameterized Queries',
        description: 'Replace dynamic SQL with parameterized queries',
        difficulty: 'medium',
        category: 'patch'
      },
      {
        id: 2,
        title: 'Implement Database User Permissions',
        description: 'Restrict database user permissions to minimum required',
        commands: [
          "REVOKE ALL ON database.* FROM 'app_user'@'%';",
          "GRANT SELECT, INSERT, UPDATE ON specific_tables TO 'app_user'@'%';"
        ],
        difficulty: 'medium',
        category: 'configuration'
      },
      {
        id: 3,
        title: 'Enable Database Auditing',
        description: 'Set up logging to monitor database access',
        difficulty: 'advanced',
        category: 'monitoring'
      }
    ]
  },
  {
    id: 'system-privilege-escalation',
    name: 'Privilege Escalation Prevention',
    description: 'Secure system against privilege escalation attacks',
    category: 'system',
    severity: 'high',
    estimatedTime: '1-3 hours',
    prerequisites: ['Root/admin access', 'System administration knowledge'],
    steps: [
      {
        id: 1,
        title: 'Update System Packages',
        description: 'Install latest security patches',
        commands: [
          "sudo apt update && sudo apt upgrade -y",
          "sudo yum update -y"
        ],
        difficulty: 'easy',
        category: 'patch'
      },
      {
        id: 2,
        title: 'Configure Sudo Restrictions',
        description: 'Limit sudo access and configure proper permissions',
        commands: [
          "sudo visudo",
          "# Review and restrict sudo permissions"
        ],
        difficulty: 'medium',
        category: 'configuration'
      },
      {
        id: 3,
        title: 'Enable System Monitoring',
        description: 'Set up monitoring for privilege escalation attempts',
        difficulty: 'advanced',
        category: 'monitoring'
      }
    ]
  }
];

export const getSolutionTemplate = (templateId: string): SolutionTemplate | undefined => {
  return solutionTemplates.find(template => template.id === templateId);
};

export const getTemplatesByCategory = (category: SolutionTemplate['category']): SolutionTemplate[] => {
  return solutionTemplates.filter(template => template.category === category);
};

export const getTemplatesBySeverity = (severity: SolutionTemplate['severity']): SolutionTemplate[] => {
  return solutionTemplates.filter(template => template.severity === severity);
};
