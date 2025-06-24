
import { Alert, AlertsStats, SystemStatus } from '../types';

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    title: 'Critical SQL Injection Vulnerability',
    description: 'A SQL injection vulnerability has been detected in the authentication system that could allow unauthorized access to user data.',
    severity: 'critical',
    date: '2023-11-05T12:30:45Z',
    system: 'Authentication Service',
    cve: 'CVE-2023-4587',
    status: 'new',
    mitigation: 'Apply security patch SP-2023-11-001 immediately and update input validation in login forms.',
    patchLink: 'https://security.example.com/patches/SP-2023-11-001',
    details: {
      affectedVersions: 'v2.1.0 - v2.3.4',
      exploitability: 'High',
      disclosureDate: '2023-11-05',
      remediationComplexity: 'Medium'
    }
  },
  {
    id: 'alert-002',
    title: 'Privilege Escalation in Admin Console',
    description: 'Users with standard permissions can potentially gain admin privileges through a flaw in the role management system.',
    severity: 'high',
    date: '2023-11-04T09:15:22Z',
    system: 'Admin Dashboard',
    cve: 'CVE-2023-4588',
    status: 'acknowledged',
    mitigation: 'Implement strict role-based access controls and apply patch SP-2023-11-002.',
    patchLink: 'https://security.example.com/patches/SP-2023-11-002',
    details: {
      affectedVersions: 'v3.0.0 - v3.2.1',
      exploitability: 'Medium',
      disclosureDate: '2023-11-03',
      remediationComplexity: 'High'
    }
  },
  {
    id: 'alert-003',
    title: 'Cross-Site Scripting (XSS) in User Profile',
    description: 'A stored XSS vulnerability exists in the user profile page that could allow attackers to inject malicious scripts.',
    severity: 'medium',
    date: '2023-11-03T14:45:10Z',
    system: 'User Management',
    cve: 'CVE-2023-4590',
    status: 'resolved',
    mitigation: 'Implement proper output encoding and sanitize user inputs. Apply patch SP-2023-11-003.',
    patchLink: 'https://security.example.com/patches/SP-2023-11-003'
  },
  {
    id: 'alert-004',
    title: 'Insecure Direct Object Reference in API',
    description: 'The API endpoint for retrieving user documents does not properly validate object references, allowing access to unauthorized documents.',
    severity: 'high',
    date: '2023-11-02T10:20:15Z',
    system: 'API Gateway',
    cve: 'CVE-2023-4593',
    status: 'new',
    mitigation: 'Implement proper access control checks in the API gateway and apply patch SP-2023-11-004.',
    patchLink: 'https://security.example.com/patches/SP-2023-11-004'
  },
  {
    id: 'alert-005',
    title: 'Outdated SSL Configuration',
    description: 'The system is using outdated SSL protocols and cipher suites that are vulnerable to known attacks.',
    severity: 'medium',
    date: '2023-11-01T16:30:45Z',
    system: 'Network Infrastructure',
    status: 'acknowledged',
    mitigation: 'Update SSL configuration to use TLS 1.3 and strong cipher suites. Follow security guide SG-2023-11-001.',
    patchLink: 'https://security.example.com/guides/SG-2023-11-001'
  },
  {
    id: 'alert-006',
    title: 'Denial of Service Vulnerability',
    description: 'A vulnerability in the request processing pipeline could allow attackers to cause a denial of service by sending specially crafted requests.',
    severity: 'high',
    date: '2023-10-31T08:45:30Z',
    system: 'Web Server',
    cve: 'CVE-2023-4597',
    status: 'resolved',
    mitigation: 'Implement rate limiting and request validation. Apply patch SP-2023-10-001.',
    patchLink: 'https://security.example.com/patches/SP-2023-10-001'
  },
  {
    id: 'alert-007',
    title: 'Weak Password Policy',
    description: 'The current password policy does not enforce sufficient complexity, allowing weak passwords.',
    severity: 'low',
    date: '2023-10-30T11:20:15Z',
    system: 'Identity Provider',
    status: 'acknowledged',
    mitigation: 'Update password policy to enforce stronger passwords and implement password strength validation.'
  },
  {
    id: 'alert-008',
    title: 'Missing Data Encryption',
    description: 'Sensitive data in the customer database is stored without encryption, posing a risk if database is compromised.',
    severity: 'high',
    date: '2023-10-29T14:10:05Z',
    system: 'Customer Database',
    status: 'new',
    mitigation: 'Implement data encryption at rest and in transit. Follow security guide SG-2023-10-002.',
    patchLink: 'https://security.example.com/guides/SG-2023-10-002'
  }
];

export const mockSystemStatus: SystemStatus[] = [
  {
    name: 'Authentication Service',
    status: 'critical',
    alertsCount: 2,
    highSeverityCount: 1
  },
  {
    name: 'Admin Dashboard',
    status: 'degraded',
    alertsCount: 1,
    highSeverityCount: 1
  },
  {
    name: 'User Management',
    status: 'operational',
    alertsCount: 1,
    highSeverityCount: 0
  },
  {
    name: 'API Gateway',
    status: 'degraded',
    alertsCount: 1,
    highSeverityCount: 1
  },
  {
    name: 'Network Infrastructure',
    status: 'operational',
    alertsCount: 1,
    highSeverityCount: 0
  },
  {
    name: 'Web Server',
    status: 'operational',
    alertsCount: 1,
    highSeverityCount: 0
  },
  {
    name: 'Identity Provider',
    status: 'operational',
    alertsCount: 1,
    highSeverityCount: 0
  },
  {
    name: 'Customer Database',
    status: 'degraded',
    alertsCount: 1,
    highSeverityCount: 1
  }
];

export const mockAlertsStats: AlertsStats = {
  total: mockAlerts.length,
  bySeverity: {
    low: mockAlerts.filter(a => a.severity === 'low').length,
    medium: mockAlerts.filter(a => a.severity === 'medium').length,
    high: mockAlerts.filter(a => a.severity === 'high').length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length
  },
  resolved: mockAlerts.filter(a => a.status === 'resolved').length,
  new: mockAlerts.filter(a => a.status === 'new').length,
  acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length
};
