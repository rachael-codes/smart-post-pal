import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthPage } from '@/components/auth/AuthPage';

const Auth = () => {
  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Parse #access_token from Supabase magic link
        await supabase.auth.getSessionFromUrl({ storeSession: true });
        // Redirect user to homepage after verification
        window.location.href = "https://smart-post-ai.vercel.app";
      } catch (err) {
        console.error("Error handling verification link:", err);
      }
    };

    handleMagicLink();
  }, []);

  // While processing the magic link
  return <p>Finishing sign in… please wait</p> || <AuthPage />;
};

export default Auth;
