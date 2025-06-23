
import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const AuthLayout = ({ title, description, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
            <Shield className="h-14 w-14 text-primary" />
            <span className="ml-3 text-4xl font-bold text-white tracking-tight">HAWK</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white tracking-tight">{title}</h1>
          <p className="mt-3 text-gray-300 text-lg max-w-lg mx-auto">{description}</p>
        </div>

        <Card className="p-8 shadow-2xl backdrop-blur-md bg-white/10 border-white/20 rounded-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-blue-400 to-purple-500 transform -skew-y-6 -translate-y-12"></div>
            <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-r from-indigo-500 to-blue-600 transform skew-y-6 translate-y-12"></div>
          </div>
          
          {/* Security icon */}
          <div className="absolute top-4 right-4 text-white/20">
            <Lock className="h-20 w-20 rotate-12" />
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </Card>
        
        <div className="mt-8 text-center text-gray-400 text-sm flex flex-col items-center">
          <p>Secure authentication powered by HAWK</p>
          <div className="flex items-center mt-2 space-x-1">
            <div className="h-1 w-1 rounded-full bg-green-400"></div>
            <span className="text-xs text-green-400">Enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
