import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Wrench } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-primary-600/90 to-primary-700/90" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl mb-8 text-white/90 animate-slide-in">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-in">
              <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all">
                {t('landing.hero.cta')}
              </Link>
              <Link to="/contact" className="btn bg-primary-400/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 transition-all">
                {t('landing.hero.demo')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The complete property management solution designed for European landlords
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Property Management */}
            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-6">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">
                {t('landing.features.propertyManagement.title')}
              </h3>
              <p className="text-neutral-600">
                {t('landing.features.propertyManagement.description')}
              </p>
            </div>

            {/* Tenant Management */}
            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">
                {t('landing.features.tenantManagement.title')}
              </h3>
              <p className="text-neutral-600">
                {t('landing.features.tenantManagement.description')}
              </p>
            </div>

            {/* Financial Tools */}
            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center text-warning mb-6">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">
                {t('landing.features.financialTools.title')}
              </h3>
              <p className="text-neutral-600">
                {t('landing.features.financialTools.description')}
              </p>
            </div>

            {/* Maintenance */}
            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center text-error mb-6">
                <Wrench size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">
                {t('landing.features.maintenance.title')}
              </h3>
              <p className="text-neutral-600">
                {t('landing.features.maintenance.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose the plan that works for your property portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-all border border-neutral-200">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-neutral-900">
                  {t('landing.pricing.starter.title')}
                </h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-neutral-900">
                    {t('landing.pricing.starter.price')}
                  </span>
                  <span className="text-neutral-600 ml-2 pb-1">
                    {t('landing.pricing.starter.unit')}
                  </span>
                </div>
                <p className="text-neutral-600 mb-6">
                  {t('landing.pricing.starter.description')}
                </p>
                <ul className="space-y-3 mb-8">
                  {t('landing.pricing.starter.features', { returnObjects: true }).map(
                    (feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-secondary mr-2">✓</span>
                        <span className="text-neutral-600">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link
                  to="/signup"
                  className="btn-primary w-full text-center block"
                >
                  {t('landing.pricing.starter.cta')}
                </Link>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-xl shadow-elevated overflow-hidden border-2 border-primary transform scale-105">
              <div className="bg-primary text-white py-2 text-center text-sm font-medium">
                Most Popular
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-neutral-900">
                  {t('landing.pricing.professional.title')}
                </h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-neutral-900">
                    {t('landing.pricing.professional.price')}
                  </span>
                  <span className="text-neutral-600 ml-2 pb-1">
                    {t('landing.pricing.professional.unit')}
                  </span>
                </div>
                <p className="text-neutral-600 mb-6">
                  {t('landing.pricing.professional.description')}
                </p>
                <ul className="space-y-3 mb-8">
                  {t('landing.pricing.professional.features', { returnObjects: true }).map(
                    (feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-secondary mr-2">✓</span>
                        <span className="text-neutral-600">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link
                  to="/signup"
                  className="btn-primary w-full text-center block"
                >
                  {t('landing.pricing.professional.cta')}
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-all border border-neutral-200">
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-neutral-900">
                  {t('landing.pricing.enterprise.title')}
                </h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-neutral-900">
                    {t('landing.pricing.enterprise.price')}
                  </span>
                </div>
                <p className="text-neutral-600 mb-6">
                  {t('landing.pricing.enterprise.description')}
                </p>
                <ul className="space-y-3 mb-8">
                  {t('landing.pricing.enterprise.features', { returnObjects: true }).map(
                    (feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-secondary mr-2">✓</span>
                        <span className="text-neutral-600">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link
                  to="/contact"
                  className="btn-secondary w-full text-center block"
                >
                  {t('landing.pricing.enterprise.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['testimonial1', 'testimonial2', 'testimonial3'].map((key, index) => (
              <div key={key} className="bg-neutral-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                    {t(`landing.testimonials.${key}.author`).charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-neutral-900">{t(`landing.testimonials.${key}.author`)}</p>
                    <p className="text-sm text-neutral-600">{t(`landing.testimonials.${key}.company`)}</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic">"{t(`landing.testimonials.${key}.quote`)}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to simplify your property management?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of property managers across Europe who are saving time and increasing profitability.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/signup"
                className="btn bg-white text-primary hover:bg-primary-50"
              >
                Start Your Free Trial
              </Link>
              <Link
                to="/contact"
                className="btn bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;