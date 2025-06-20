import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          'properties.title': 'Properties',
          'properties.newProperty': 'New Property',
          'properties.name': 'Name',
          'properties.address': 'Address',
          'properties.units': 'Units',
          'properties.vacancyRate': 'Vacancy Rate',
          'properties.defaultVat': 'Default VAT',
          'properties.hasVacancies': 'Has Vacancies',
          'properties.fullyOccupied': 'Fully Occupied',
          'common.search': 'Search',
          'common.all': 'All',
          'common.actions': 'Actions',
          'common.view': 'View',
          'common.edit': 'Edit',
          'auth.signIn': 'Sign In',
          'auth.signUp': 'Sign Up',
          'auth.email': 'Email',
          'auth.password': 'Password',
          'auth.confirmPassword': 'Confirm Password',
          'auth.firstName': 'First Name',
          'auth.lastName': 'Last Name',
          'units.title': 'Units',
          'tenants.title': 'Tenants',
          'dashboard.title': 'Dashboard',
        },
      },
    },
  });

interface CustomRenderOptions extends RenderOptions {
  initialEntries?: string[];
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };