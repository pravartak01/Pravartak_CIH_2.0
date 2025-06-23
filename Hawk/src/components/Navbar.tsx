
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Shield, User, Menu, X, Settings, HelpCircle, LogOut } from 'lucide-react';
import { mockAlerts } from '../utils/mockData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '../../public/Logo/Logo.png'
import LogoColor from '../../public/Logo/Logo.jpg'
const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const newAlertsCount = mockAlerts.filter(alert => alert.status === 'new').length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  const userEmail = user?.email;
  const userData = user?.user_metadata;
  const fullName = userData?.full_name || 'User';
  const organization = userData?.organization;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="HAWK Logo" title="HAWK Logo" className="h-8 w-8 text-primary" />
          <Link to={user ? "/dashboard" : "/"} className="text-xl font-semibold tracking-tight">HAWK</Link>
        </div>
        
        {user ? (
          <>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors duration-200">Dashboard</Link>
              <Link to="/alerts" className="text-gray-600 hover:text-primary transition-colors duration-200">Alerts</Link>
              <Link to="/system-monitor" className="text-gray-600 hover:text-primary transition-colors duration-200">Systems</Link>
              <Link to="/reports" className="text-gray-600 hover:text-primary transition-colors duration-200">Reports</Link>
              <Link to="/settings" className="text-gray-600 hover:text-primary transition-colors duration-200">Settings</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-primary transition-colors duration-200">
                <Search className="h-5 w-5" />
              </button>
              
              <button className="text-gray-600 hover:text-primary transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                {newAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-alert-critical text-[10px] font-bold text-white">
                    {newAlertsCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button 
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-200"
                  onClick={handleProfileClick}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden lg:block text-sm">{fullName}</span>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                      {organization && (
                        <p className="text-xs text-gray-500 mt-1">Organization: {organization}</p>
                      )}
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                className="md:hidden text-gray-600 hover:text-primary transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/auth/login" className="text-gray-600 hover:text-primary transition-colors duration-200">
              Login
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" variant="default">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-down">
          <div className="flex flex-col p-4 space-y-3">
            <Link to="/dashboard" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Dashboard</Link>
            <Link to="/alerts" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Alerts</Link>
            <Link to="/system-monitor" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Systems</Link>
            <Link to="/reports" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Reports</Link>
            <Link to="/settings" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Settings</Link>
            <Link to="/profile" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Profile</Link>
            <Link to="/help" className="text-gray-600 py-2 px-4 hover:bg-gray-50 rounded-md">Help & Support</Link>
            <button 
              onClick={handleLogout}
              className="text-left text-red-600 py-2 px-4 hover:bg-gray-50 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
