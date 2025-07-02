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

    console.log('Loading Google Identity Services with client ID:', clientId);

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript && window.google) {
      console.log('Google Identity Services already loaded, rendering button');
      renderGoogleButton();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Identity Services script loaded');
      renderGoogleButton();
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      onFailure(new Error('Failed to load Google Identity Services'));
    };

    document.head.appendChild(script);

    function renderGoogleButton() {
      if (window.google && googleButtonRef.current) {
        console.log('Rendering Google button');
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential: string }) => {
              console.log('Google login successful');
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
        } catch (error) {
          console.error('Error rendering Google button:', error);
          onFailure(error);
        }
      } else {
        console.warn('Google not available or button ref not ready');
      }
    }

    return () => {
      // Clean up script only if we added it
      if (!existingScript) {
        const scriptToRemove = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (scriptToRemove) {
          document.head.removeChild(scriptToRemove);
        }
      }
    };
  }, [clientId, onSuccess, onFailure]);

  if (!clientId) {
    console.warn('Google Client ID not configured - showing placeholder button');
    return (
      <button
        type="button"
        disabled
        className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#9CA3AF"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#9CA3AF"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#9CA3AF"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#9CA3AF"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google (Not Configured)
      </button>
    );
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