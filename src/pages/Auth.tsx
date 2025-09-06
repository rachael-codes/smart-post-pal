import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

   useEffect(() => {
    // Supabase automatically parses ?code= from the URL and updates the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // ✅ Redirect user into dashboard after successful verification
        navigate("/dashboard");
      } else {
        // No session yet → maybe show a loading or error state
        navigate("/");
      }
    });
  }, [navigate]);

  return <p>Finishing sign in... please wait</p>;

export default Auth;
