import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthPage } from '@/components/auth/AuthPage';

const Auth = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Only process if there are auth parameters in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (!accessToken) {
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      
      try {
        // Get current session after auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session && !error) {
          // Successfully verified, redirect to home
          navigate('/', { replace: true });
          return;
        }
        
        if (error) {
          console.error("Auth verification error:", error.message);
        }
      } catch (err) {
        console.error("Error processing auth callback:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Verifying your email... please wait</p>
      </div>
    );
  }

  return <AuthPage />;
};

export default Auth;
