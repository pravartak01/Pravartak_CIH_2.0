
import { useEffect, createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationMetadata } from '@/types';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

// Create context for notification state
type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      if (data) {
        // Convert data to Notification[] type with proper metadata conversion
        const typedNotifications: Notification[] = data.map(item => ({
          ...item,
          metadata: item.metadata as unknown as NotificationMetadata
        }));
        
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.filter((notification) => !notification.is_read).length);
        
        // Log that notifications were fetched successfully
        console.log("Notifications fetched successfully:", typedNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time notification subscription for user:", user.id);
    
    // Initial fetch
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Real-time notification received:", payload);
          
          // Add new notification to the state with proper type conversion
          const newData = payload.new as any;
          const newNotification: Notification = {
            ...newData,
            metadata: newData.metadata as unknown as NotificationMetadata
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast(
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">{newNotification.title}</span>
                <span className="text-sm text-muted-foreground">{newNotification.content}</span>
              </div>
            </div>,
            {
              action: {
                label: "View",
                onClick: () => markAsRead(newNotification.id),
              },
            }
          );
        }
      )
      .subscribe();
    
    console.log("Notification subscription activated");
    
    return () => {
      console.log("Cleaning up notification subscription");
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
