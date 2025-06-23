
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BarChart2, Settings, Menu, X, AlertTriangle, Shield, Clock, MessageSquare, Layout, History, PieChart, HelpCircle } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import NotificationBadge from '@/components/NotificationBadge';

const DashboardNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Layout className="h-4 w-4 mr-2" /> },
    { href: '/alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
    { href: '/system-monitor', label: 'System Monitor', icon: <Shield className="h-4 w-4 mr-2" /> },
    { href: '/scan-history', label: 'Scan History', icon: <History className="h-4 w-4 mr-2" /> },
    { href: '/reports', label: 'Reports', icon: <PieChart className="h-4 w-4 mr-2" /> },
    { href: '/chatbot', label: 'AI Assistant', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    { href: '/help', label: 'Help & Support', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex h-16 items-center border-b">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>HAWK</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 py-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center px-2 py-1.5 text-sm hover:text-primary transition-colors ${
                      isActive(item.href) ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span className="hidden md:inline-block">HAWK</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center text-sm hover:text-primary transition-colors ${
                  isActive(item.href) ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBadge />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
