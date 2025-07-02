import React, { useEffect, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onFailure: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onFailure,
  disabled = false
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            onSuccess(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: '100%',
            logo_alignment: 'left',
          }
        );
      }
    };

    script.onerror = () => {
      onFailure(new Error('Failed to load Google Identity Services'));
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [clientId, onSuccess, onFailure]);

  if (!clientId) {
    return null;
  }

  return (
    <div 
      ref={googleButtonRef}
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
      style={{ width: '100%' }}
    />
  );
};

export default GoogleLoginButton;