
import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto px-4 py-6 bg-white/50 backdrop-blur-sm border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">HAWK Security</span>
          <span className="text-sm text-gray-500">v1.0.0</span>
        </div>
        
        <div className="text-sm text-gray-500">
          © {currentYear} HAWK Security. All rights reserved.
        </div>
        
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <a href="#docs" className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center">
            Documentation
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
          <a href="#support" className="text-sm text-gray-600 hover:text-primary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
