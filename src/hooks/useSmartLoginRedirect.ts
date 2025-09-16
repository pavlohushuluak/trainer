import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSmartLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a SmartLoginModal OAuth redirect flag
    const smartLoginRedirect = sessionStorage.getItem('smartlogin_oauth_redirect');
    
    if (smartLoginRedirect === 'true') {
      console.log('🔐 SmartLoginModal redirect: Found redirect flag, redirecting to homepage');
      
      // Remove the flag
      sessionStorage.removeItem('smartlogin_oauth_redirect');
      
      // Redirect to homepage
      navigate('/', { replace: true });
    }
  }, [navigate]);
};
