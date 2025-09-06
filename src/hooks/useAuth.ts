import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const redirectUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription when user is authenticated
      if (session?.user) {
        setTimeout(() => {
          supabase.functions.invoke('check-subscription').catch(console.error);
        }, 0);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription when user signs in
      if (session?.user) {
        setTimeout(() => {
          supabase.functions.invoke('check-subscription').catch(console.error);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

const signUp = async (email: string, password: string, displayName?: string) => {
  const redirectUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173/auth";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: displayName,
      },
    },
  });

  return { error };
};



  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
