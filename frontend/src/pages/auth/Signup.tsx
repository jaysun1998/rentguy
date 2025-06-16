import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../types';

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: 'gb',
  });
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password strength validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    // First name validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    try {
      await signup(formData);
      navigate('/dashboard'); // Redirect on success
    } catch (error) {
      console.error('Signup form error:', error);
      setError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
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
            {t('auth.signUp')}
          </h1>
          
          {error && (
            <div className="bg-error-100 text-error p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  {t('auth.firstName')}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="form-label">
                  {t('auth.lastName')}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                required
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                required
                minLength={8}
              />
            </div>
            

            <div className="mb-6">
              <label htmlFor="country" className="form-label">
                {t('auth.country')}
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input w-full"
                required
              >
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
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
                t('auth.createAccount')
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-neutral-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:text-primary-600 font-medium">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;