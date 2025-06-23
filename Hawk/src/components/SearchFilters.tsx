
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, X, Clock, AlertTriangle, Check } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { severity: string[]; status: string[] }) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSeverityChange = (severity: string) => {
    setSelectedSeverities(prev => {
      const newSeverities = prev.includes(severity) 
        ? prev.filter(s => s !== severity) 
        : [...prev, severity];
      
      onFilterChange({ severity: newSeverities, status: selectedStatuses });
      return newSeverities;
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => {
      const newStatuses = prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status];
      
      onFilterChange({ severity: selectedSeverities, status: newStatuses });
      return newStatuses;
    });
  };
  
  const clearAllFilters = () => {
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    onFilterChange({ severity: [], status: [] });
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-3.5 w-3.5 text-alert-high" />;
      case 'medium':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case 'low':
        return <AlertTriangle className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-3.5 w-3.5 text-red-600" />;
      case 'acknowledged':
        return <Clock className="h-3.5 w-3.5 text-amber-600" />;
      case 'resolved':
        return <Check className="h-3.5 w-3.5 text-emerald-600" />;
      default:
        return null;
    }
  };

  // Close filters dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="glass-card rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
            placeholder="Search alerts by title, system, or CVE..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="relative" ref={filtersRef}>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center justify-center space-x-2 border rounded-lg px-4 py-2.5 w-full md:w-auto transition-colors duration-200 ${
              (selectedSeverities.length > 0 || selectedStatuses.length > 0)
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {(selectedSeverities.length > 0 || selectedStatuses.length > 0) && (
              <span className="flex items-center justify-center h-5 w-5 bg-primary text-white text-xs rounded-full">
                {selectedSeverities.length + selectedStatuses.length}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isFiltersOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 animate-slide-down">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                {(selectedSeverities.length > 0 || selectedStatuses.length > 0) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Severity</h3>
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map(severity => (
                    <label key={severity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSeverities.includes(severity)}
                        onChange={() => handleSeverityChange(severity)}
                        className="rounded text-primary focus:ring-primary/30"
                      />
                      <div className="flex items-center">
                        {getSeverityIcon(severity)}
                        <span className="text-sm capitalize ml-1">{severity}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Status</h3>
                <div className="space-y-2">
                  {['new', 'acknowledged', 'resolved'].map(status => (
                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                        className="rounded text-primary focus:ring-primary/30"
                      />
                      <div className="flex items-center">
                        {getStatusIcon(status)}
                        <span className="text-sm capitalize ml-1">{status}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsFiltersOpen(false)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Active filters */}
      {(selectedSeverities.length > 0 || selectedStatuses.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedSeverities.map(severity => (
            <div key={severity} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center">
              {getSeverityIcon(severity)}
              <span className="capitalize ml-1">{severity}</span>
              <button 
                onClick={() => handleSeverityChange(severity)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {selectedStatuses.map(status => (
            <div key={status} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center">
              {getStatusIcon(status)}
              <span className="capitalize ml-1">{status}</span>
              <button 
                onClick={() => handleStatusChange(status)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
