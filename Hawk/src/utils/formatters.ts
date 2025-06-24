
import { AlertSeverity } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
};

export const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'alert-critical';
    case 'high':
      return 'alert-high';
    case 'medium':
      return 'alert-medium';
    case 'low':
      return 'alert-low';
    default:
      return 'gray-400';
  }
};

export const getSeverityTextColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'text-alert-critical';
    case 'high':
      return 'text-alert-high';
    case 'medium':
      return 'text-alert-medium';
    case 'low':
      return 'text-alert-low';
    default:
      return 'text-gray-400';
  }
};

export const getSeverityBgColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-alert-critical';
    case 'high':
      return 'bg-alert-high';
    case 'medium':
      return 'bg-alert-medium';
    case 'low':
      return 'bg-alert-low';
    default:
      return 'bg-gray-400';
  }
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};
