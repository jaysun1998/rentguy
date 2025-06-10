import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../ui/LanguageSelector';
import Logo from '../ui/Logo';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo size="md" />
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/features') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/pricing') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                About
              </Link>
              <Link 
                to="/resources" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/resources') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                Resources
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium"
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
              >
                <Globe size={18} className="mr-1" />
                <span>EN</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              
              {isLanguageSelectorOpen && (
                <LanguageSelector 
                  onClose={() => setIsLanguageSelectorOpen(false)} 
                />
              )}
            </div>
            
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="btn-primary shadow-sm hover:shadow-md transition-shadow"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn-secondary shadow-sm hover:shadow-md transition-shadow"
                >
                  {t('auth.signIn')}
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary shadow-sm hover:shadow-md transition-shadow"
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-neutral-600 hover:text-neutral-900 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-fade-in">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/features') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/pricing') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/about') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              About
            </Link>
            <Link 
              to="/resources" 
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/resources') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Resources
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4">
              <button
                type="button"
                className="flex items-center text-neutral-600 hover:text-neutral-900"
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
              >
                <Globe size={18} className="mr-2" />
                <span>EN</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="mt-3 space-y-2 px-4">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary-600 shadow-sm hover:shadow-md transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-primary border border-primary hover:bg-primary-50 shadow-sm hover:shadow-md transition-all"
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary-600 shadow-sm hover:shadow-md transition-all"
                  >
                    {t('auth.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isLanguageSelectorOpen && (
        <div className="md:hidden">
          <LanguageSelector 
            onClose={() => setIsLanguageSelectorOpen(false)} 
            isMobile={true}
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;