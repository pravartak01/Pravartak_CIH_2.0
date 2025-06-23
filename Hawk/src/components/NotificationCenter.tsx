import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Check, AlertTriangle, Clock, Shield, Info, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Notification, NotificationMetadata } from '@/types';

// Mock notifications for development when table doesn't exist
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Critical vulnerability detected',
    content: 'CVE-2023-1234: Buffer overflow in network stack',
    created_at: new Date().toISOString(),
    is_read: false,
    type: 'vulnerability',
    metadata: {
      severity: 'critical',
      cve: 'CVE-2023-1234',
      system: 'Network Infrastructure'
    }
  },
  {
    id: '2',
    user_id: '1',
    title: 'Scan completed',
    content: '5 new vulnerabilities detected in recent scan',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: false,
    type: 'scan',
    metadata: {
      scanType: 'manual',
      findings: 5
    }
  },
  {
    id: '3',
    user_id: '1',
    title: 'High vulnerability detected',
    content: 'CVE-2023-5678: Authentication bypass in admin panel',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_read: true,
    type: 'vulnerability',
    metadata: {
      severity: 'high',
      cve: 'CVE-2023-5678',
      system: 'Admin Control Panel'
    }
  }
];

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Check if notifications table exists by trying to query it
      let tableExists = true;
      try {
        // Using the generic query method to avoid TypeScript schema validation
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true }) as any;
          
        if (error) {
          console.error('Error checking notifications table:', error);
          tableExists = false;
        }
      } catch (error) {
        console.error('Error checking table existence:', error);
        tableExists = false;
      }
      
      if (tableExists && user) {
        // Fetch real notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        if (data) {
          // Convert the database data to properly typed Notification objects
          const typedNotifications: Notification[] = data.map(item => ({
            ...item,
            metadata: item.metadata as NotificationMetadata
          }));
          
          setNotifications(typedNotifications);
          setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
        }
      } else {
        // Use mock data if table doesn't exist or no user
        console.log('Using mock notification data');
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      // Fallback to mock data
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Find the notification in our local state
      const notification = notifications.find(n => n.id === id);
      if (!notification || notification.is_read) return;
      
      // Try to update in database if it exists
      let success = false;
      try {
        if (user) {
          const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', user.id);
            
          if (!error) {
            success = true;
          } else {
            console.error('Failed to update notification in database:', error);
          }
        }
      } catch (error) {
        console.error('Error updating notification:', error);
      }
      
      if (success || !user) {
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      let success = false;
      
      // Try to update in database if user exists
      if (user) {
        try {
          const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
          if (!error) {
            success = true;
          } else {
            console.error('Failed to update notifications in database:', error);
          }
        } catch (error) {
          console.error('Error updating notifications:', error);
        }
      }
      
      if (success || !user) {
        // Update local state
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const getNotificationIcon = (type: string, metadata?: NotificationMetadata) => {
    if (type === 'vulnerability') {
      const severity = metadata?.severity || 'medium';
      if (severity === 'critical') {
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      } else if (severity === 'high') {
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      } else {
        return <Info className="h-5 w-5 text-blue-500" />;
      }
    } else if (type === 'scan') {
      return <Shield className="h-5 w-5 text-primary" />;
    } else {
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-primary">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">You'll see updates here when they happen</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type, notification.metadata)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className={`text-sm font-medium ${notification.is_read ? '' : 'text-blue-800'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <X className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
                  
                  {notification.type === 'vulnerability' && notification.metadata?.cve && (
                    <Badge variant="outline" className={`
                      mt-2 text-[10px] ${
                        notification.metadata?.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        notification.metadata?.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        notification.metadata?.severity === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }
                    `}>
                      {notification.metadata.cve}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
