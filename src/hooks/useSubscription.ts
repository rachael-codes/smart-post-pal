import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_end?: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({ subscribed: false, subscription_tier: 'free' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      setSubscription(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      // Only show toast for non-network/auth errors to avoid spam
      if (!error.message?.includes('Failed to fetch') && 
          !error.message?.includes('Authentication error') &&
          !error.message?.includes('Session from session_id claim')) {
        toast({
          title: "Error checking subscription",
          description: error.message,
          variant: "destructive",
        });
      }
      // Set default subscription state on error
      setSubscription({ subscribed: false, subscription_tier: 'free' });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (plan: 'pro' | 'enterprise') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error creating checkout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error opening customer portal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};