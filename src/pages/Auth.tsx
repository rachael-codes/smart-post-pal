import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // This parses the URL for the magic link / email verification
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          setError(error.message);
        } else if (data.session) {
          // User is now signed in → redirect to dashboard
          navigate('/dashboard');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleMagicLink();
  }, [navigate]);

  if (loading) return <p>Verifying your account… please wait</p>;
  if (error) return <p>Error: {error}</p>;

  // If not a magic link, just render the normal AuthPage
  return <AuthPage />;
};

export default Auth;
