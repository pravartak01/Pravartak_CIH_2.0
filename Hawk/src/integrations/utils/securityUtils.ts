
import { Alert, AlertSeverity } from "@/types";

// Calculate risk score for a vulnerability
export const calculateRiskScore = (
  severity: AlertSeverity,
  hasExploit: boolean,
  systemCriticality: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): number => {
  // Base score by severity
  const severityScore = 
    severity === 'critical' ? 10 :
    severity === 'high' ? 7 :
    severity === 'medium' ? 4 : 1;
  
  // Exploit multiplier
  const exploitMultiplier = hasExploit ? 1.5 : 1;
  
  // System criticality multiplier
  const criticalityMultiplier = 
    systemCriticality === 'critical' ? 1.3 :
    systemCriticality === 'high' ? 1.2 :
    systemCriticality === 'medium' ? 1 : 0.8;
  
  // Calculate final score (0-10 scale)
  const rawScore = severityScore * exploitMultiplier * criticalityMultiplier;
  return Math.min(Math.round(rawScore * 10) / 10, 10);
};

// Prioritize vulnerabilities for concise reporting
export const prioritizeVulnerabilities = (alerts: Alert[]): Alert[] => {
  if (!alerts || alerts.length === 0) return [];
  
  return [...alerts].sort((a, b) => {
    // First priority: Critical vulnerabilities with exploits
    const aHasExploit = a.details && typeof a.details === 'object' && 'exploitAvailable' in a.details 
      ? Boolean(a.details.exploitAvailable) 
      : false;
      
    const bHasExploit = b.details && typeof b.details === 'object' && 'exploitAvailable' in b.details 
      ? Boolean(b.details.exploitAvailable) 
      : false;
    
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    
    // Second priority: Exploitability
    if (aHasExploit && !bHasExploit) return -1;
    if (!aHasExploit && bHasExploit) return 1;
    
    // Third priority: Severity level
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    
    // Fourth priority: Newest first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Generate concise recommendations based on vulnerability
export const generateRecommendations = (alert: Alert): string[] => {
  const recommendations: string[] = [];
  
  // Always include the mitigation if available
  if (alert.mitigation) {
    recommendations.push(alert.mitigation);
  }
  
  // Add standard recommendations based on severity
  if (alert.severity === 'critical') {
    recommendations.push('Prioritize immediate patching or mitigation');
    recommendations.push('Consider temporary isolation of affected systems');
  } else if (alert.severity === 'high') {
    recommendations.push('Schedule patching within 7 days');
    recommendations.push('Implement additional monitoring for affected systems');
  }
  
  // Add recommendations based on system type
  if (alert.system.toLowerCase().includes('web')) {
    recommendations.push('Review web application firewall rules');
  } else if (alert.system.toLowerCase().includes('database')) {
    recommendations.push('Verify database access controls and consider data encryption');
  } else if (alert.system.toLowerCase().includes('authentication')) {
    recommendations.push('Implement multi-factor authentication if not already in place');
  }
  
  return recommendations;
};

// Generate a concise security summary
export const generateSecuritySummary = (stats: {
  critical: number;
  high: number;
  medium: number;
  low: number;
}): string => {
  const total = stats.critical + stats.high + stats.medium + stats.low;
  
  if (total === 0) {
    return 'No active vulnerabilities detected. Systems appear secure.';
  }
  
  if (stats.critical > 0) {
    return `Critical attention required: ${stats.critical} critical vulnerabilities detected that require immediate action.`;
  }
  
  if (stats.high > 2) {
    return `High security risk: Multiple high severity vulnerabilities (${stats.high}) need addressing soon.`;
  }
  
  if (stats.high > 0) {
    return `Moderate security concerns: ${stats.high} high and ${stats.medium} medium vulnerabilities require scheduled remediation.`;
  }
  
  return `Low security risk: ${total} low to medium vulnerabilities should be addressed in regular maintenance.`;
};
