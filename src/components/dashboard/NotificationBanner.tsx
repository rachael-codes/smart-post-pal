import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, addHours } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  scheduled_for: string;
  sent: boolean;
  type: string;
  posts: {
    id: string;
    title: string;
    content: string;
    platforms: {
      name: string;
      color: string;
      icon: string;
    };
  };
}

export const NotificationBanner = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up real-time subscription for new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const now = new Date();
      const oneHourFromNow = addHours(now, 1);

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          message,
          scheduled_for,
          sent,
          type,
          posts (
            id,
            title,
            content,
            platforms:platform_id (
              name,
              color,
              icon
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('sent', false)
        .lte('scheduled_for', oneHourFromNow.toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSent = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ sent: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      toast({
        title: "Notification dismissed",
        description: "The notification has been marked as handled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to dismiss notification.",
        variant: "destructive",
      });
    }
  };

  const openPlatform = (platformName: string) => {
    const platformUrls: Record<string, string> = {
      'Instagram': 'https://www.instagram.com',
      'Twitter/X': 'https://twitter.com/compose/tweet',
      'LinkedIn': 'https://www.linkedin.com',
      'Facebook': 'https://www.facebook.com',
      'TikTok': 'https://www.tiktok.com/upload',
      'YouTube': 'https://studio.youtube.com',
    };

    const url = platformUrls[platformName] || '#';
    window.open(url, '_blank');
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((notification) => {
        const scheduledTime = new Date(notification.scheduled_for);
        const now = new Date();
        const isOverdue = isAfter(now, scheduledTime);
        const isUpcoming = isBefore(now, scheduledTime);

        return (
          <Card key={notification.id} className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {notification.message}
                      </p>
                      <Badge 
                        variant={isOverdue ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'Now'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Scheduled for: {format(scheduledTime, 'MMM d, yyyy at h:mm a')}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Platform:</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${notification.posts.platforms?.color}10`,
                          borderColor: notification.posts.platforms?.color 
                        }}
                      >
                        {notification.posts.platforms?.name}
                      </Badge>
                    </div>

                    {notification.posts.content && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <p className="font-medium mb-1">Content preview:</p>
                        <p className="text-muted-foreground line-clamp-2">
                          {notification.posts.content.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openPlatform(notification.posts.platforms?.name)}
                    className="gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Post Now
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsSent(notification.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Done
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsSent(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};