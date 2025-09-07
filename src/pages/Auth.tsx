import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthPage } from '@/components/auth/AuthPage';

const Auth = () => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a magic link callback
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session) {
          // User is authenticated, redirect to dashboard
          window.location.href = "https://smart-post-ai.vercel.app";
          return;
        }
        
        if (error) {
          console.error("Error handling auth callback:", error);
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, []);

  if (isProcessing) {
    return <p>Finishing sign in… please wait</p>;
  }

  return <AuthPage />;
};

export default Auth;
