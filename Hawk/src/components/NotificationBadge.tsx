
import React from 'react';
import { useNotifications } from './NotificationProvider';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification, NotificationMetadata } from '@/types';

const NotificationBadge = () => {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const recentNotifications = notifications.slice(0, 5);
  
  const handleViewAll = () => {
    navigate('/settings?tab=notifications');
  };
  
  const handleClick = (id: string) => {
    markAsRead(id);
    // If notification has a relevant link, navigate to it
    const notification = notifications.find(n => n.id === id);
    if (notification?.metadata?.cve) {
      // Navigate to vulnerability details if available
      navigate(`/vulnerability/${notification.metadata.cve}`);
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than a day, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If less than a week, show day
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  const getDeliveryStatusIcon = (notification: Notification) => {
    if (!notification.metadata?.delivered) return null;
    
    const delivered = notification.metadata.delivered;
    if (delivered.email) {
      return <span className="text-xs text-green-600 ml-1">📧</span>;
    }
    if (delivered.sms) {
      return <span className="text-xs text-green-600 ml-1">📱</span>;
    }
    
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => refreshNotifications()} // Refresh notifications when the bell is clicked
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs leading-none text-muted-foreground">
              {unreadCount} unread notifications
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} onClick={() => handleClick(notification.id)}>
                  <div className="flex items-start gap-2 w-full cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notification.is_read ? 'bg-primary' : 'bg-muted'}`} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                          {getDeliveryStatusIcon(notification)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.content}
                      </p>
                      {notification.metadata?.severity && (
                        <div className="mt-1">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-sm ${
                            notification.metadata.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                            notification.metadata.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.metadata.severity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full cursor-pointer justify-center" onClick={handleViewAll}>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;
