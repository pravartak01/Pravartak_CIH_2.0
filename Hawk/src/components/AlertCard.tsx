import React, { useState } from 'react';
import { ChevronDown, ExternalLink, Shield, Clock, CheckCircle, AlertTriangle, XCircle, ThumbsUp, Lightbulb } from 'lucide-react';
import { Alert } from '../types';
import { formatTimeAgo, getSeverityBgColor, getSeverityTextColor, capitalize } from '../utils/formatters';
import AlertSolutionModal from './AlertSolutionModal';

interface AlertCardProps {
  alert: Alert;
  onStatusChange: (newStatus: 'new' | 'acknowledged' | 'resolved') => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(alert.status);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  
  const severityBgColor = getSeverityBgColor(alert.severity);
  const severityTextColor = getSeverityTextColor(alert.severity);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'acknowledged':
        return 'bg-amber-100 text-amber-800';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'acknowledged':
        return <ThumbsUp className="h-4 w-4 text-amber-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      default:
        return null;
    }
  };
  
  const handleStatusChange = (newStatus: 'new' | 'acknowledged' | 'resolved') => {
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  return (
    <>
      <div className={`glass-card rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-md' : ''}`}>
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 rounded-full ${severityBgColor} animate-pulse`}></div>
              <h3 className="font-medium">{alert.title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${getStatusBadgeClass(status)}`}>
                {getStatusIcon(status)}
                <span className="ml-1">{capitalize(status)}</span>
              </span>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-y-1 text-sm text-gray-500">
            <div className="w-full sm:w-1/2">
              <span className={`font-medium ${severityTextColor}`}>{capitalize(alert.severity)}</span> severity
            </div>
            <div className="w-full sm:w-1/2 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {formatTimeAgo(alert.date)}
            </div>
            <div className="w-full sm:w-1/2">
              System: <span className="font-medium">{alert.system}</span>
            </div>
            {alert.cve && (
              <div className="w-full sm:w-1/2">
                CVE: <span className="font-medium">{alert.cve}</span>
              </div>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 border-t border-gray-100 animate-slide-down bg-gray-50/50">
            <p className="text-gray-700 mb-4">{alert.description}</p>
            
            {alert.mitigation && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Recommended Mitigation</h4>
                <p className="text-sm text-gray-700">{alert.mitigation}</p>
              </div>
            )}
            
            {alert.details && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                <div className="bg-white rounded-md p-3 text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(alert.details).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-gray-500 mr-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</span>
                      <span className="text-gray-900">{value.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4 justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('acknowledged'); }}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${status === 'acknowledged' ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800'}`}
                >
                  <ThumbsUp className="h-3 w-3 inline mr-1" />
                  Acknowledge
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('resolved'); }}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${status === 'resolved' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800'}`}
                >
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Resolve
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('new'); }}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${status === 'new' ? 'bg-red-200 text-red-800' : 'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-800'}`}
                >
                  <XCircle className="h-3 w-3 inline mr-1" />
                  Reopen
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSolutionModal(true); }}
                  className="text-xs px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                >
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  Get Solution
                </button>
              </div>
              
              {alert.patchLink && (
                <a 
                  href={alert.patchLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Download security patch
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertSolutionModal 
        alert={alert}
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
      />
    </>
  );
};

export default AlertCard;
