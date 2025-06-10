import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-primary mb-6">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 20C37.909 20 20 37.909 20 60C20 82.091 37.909 100 60 100C82.091 100 100 82.091 100 60C100 37.909 82.091 20 60 20ZM60 28C77.673 28 92 42.327 92 60C92 77.673 77.673 92 60 92C42.327 92 28 77.673 28 60C28 42.327 42.327 28 60 28ZM60 44C56.686 44 54 46.686 54 50V66C54 69.314 56.686 72 60 72C63.314 72 66 69.314 66 66V50C66 46.686 63.314 44 60 44ZM60 76C56.686 76 54 78.686 54 82C54 85.314 56.686 88 60 88C63.314 88 66 85.314 66 82C66 78.686 63.314 76 60 76Z" fill="#0052CC"/>
        </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
        404 - Page Not Found
      </h1>
      
      <p className="text-xl text-neutral-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/" className="btn-primary flex items-center justify-center">
          <Home size={18} className="mr-2" />
          Return to Home
        </Link>
        
        <Link to="/dashboard" className="btn-secondary flex items-center justify-center">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;