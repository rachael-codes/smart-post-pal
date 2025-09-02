import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useNotificationService = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedPosts = useRef<Set<string>>(new Set());

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  };

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const sendNotification = (title: string, body: string, postId: string) => {
    if (notifiedPosts.current.has(postId)) {
      return; // Already notified for this post
    }

    // Play sound
    playNotificationSound();

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        tag: `post-${postId}`, // Prevent duplicate notifications
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }

    // Show toast notification as fallback
    toast({
      title,
      description: body,
      duration: 10000,
    });

    // Mark as notified
    notifiedPosts.current.add(postId);
  };

  const checkScheduledPosts = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          scheduled_at,
          platforms!posts_platform_id_fkey (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', fiveMinutesFromNow.toISOString());

      if (error) throw error;

      posts?.forEach((post) => {
        const scheduledTime = new Date(post.scheduled_at);
        const timeUntilPost = scheduledTime.getTime() - now.getTime();
        
        // Notify if post is due within 5 minutes and we haven't already notified
        if (timeUntilPost <= 5 * 60 * 1000 && timeUntilPost > 0) {
          const minutesLeft = Math.ceil(timeUntilPost / (60 * 1000));
          sendNotification(
            '📢 Post Reminder',
            `"${post.title || 'Your post'}" is scheduled for ${post.platforms?.name} in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}!`,
            post.id
          );
        }
        
        // Notify if post is overdue
        if (timeUntilPost <= 0 && timeUntilPost > -60 * 1000) { // Within 1 minute of being overdue
          sendNotification(
            '🚨 Post Overdue',
            `"${post.title || 'Your post'}" was scheduled for ${post.platforms?.name} and is now overdue!`,
            post.id
          );
        }
      });
    } catch (error) {
      console.error('Error checking scheduled posts:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Request notification permission on first load
    requestNotificationPermission();

    // Check immediately
    checkScheduledPosts();

    // Set up interval to check every minute
    intervalRef.current = setInterval(checkScheduledPosts, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    // Clear notified posts when user changes
    if (user) {
      notifiedPosts.current.clear();
    }
  }, [user?.id]);

  return {
    requestNotificationPermission,
    checkScheduledPosts,
  };
};