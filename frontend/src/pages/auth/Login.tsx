import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center">
              <div className="text-primary">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="#0052CC"/>
                  <path d="M16 7L25 12V24H20V16H12V24H7V12L16 7Z" fill="white"/>
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold text-neutral-900">
                PropertyPro<span className="text-primary font-bold">Europe</span>
              </span>
            </div>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-card p-8">
          <h1 className="text-2xl font-semibold text-center mb-8 text-neutral-900">
            {t('auth.signIn')}
          </h1>
          
          {error && (
            <div className="bg-error-100 text-error p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between">
                <label htmlFor="password" className="form-label">
                  {t('auth.password')}
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-600">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                t('auth.signIn')
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-neutral-600">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-primary hover:text-primary-600 font-medium">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;