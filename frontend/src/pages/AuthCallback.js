import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const code = searchParams.get('code');

      if (!code) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post(
          `${API}/auth/google/callback`,
          { code },
          { withCredentials: true }
        );

        const { user } = response.data;
        navigate('/dashboard', { state: { user }, replace: true });
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback-loading">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing in with Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
