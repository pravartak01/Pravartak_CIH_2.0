
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Bell, Shield, BarChart4 } from 'lucide-react';
import { toast } from 'sonner';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been logged out');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/auth/login">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Link>
      </Button>
    );
  }

  const userInitials = user.email?.substring(0, 2).toUpperCase() || 'U';
  const userEmail = user.email || 'User';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:border-primary/30 transition-colors">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userEmail} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || userEmail}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="h-4 w-4 mr-2" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <Shield className="h-4 w-4 mr-2" />
          <span>Security Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/scan-history')}>
          <BarChart4 className="h-4 w-4 mr-2" />
          <span>Scan History</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile?tab=notifications')}>
          <Bell className="h-4 w-4 mr-2" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')}>
          <Settings className="h-4 w-4 mr-2" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 hover:text-red-500 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
