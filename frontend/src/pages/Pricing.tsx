import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('landing.pricing.starter.title'),
      price: t('landing.pricing.starter.price'),
      unit: t('landing.pricing.starter.unit'),
      description: t('landing.pricing.starter.description'),
      features: t('landing.pricing.starter.features', { returnObjects: true }),
      cta: t('landing.pricing.starter.cta'),
      popular: false
    },
    {
      name: t('landing.pricing.professional.title'),
      price: t('landing.pricing.professional.price'),
      unit: t('landing.pricing.professional.unit'),
      description: t('landing.pricing.professional.description'),
      features: t('landing.pricing.professional.features', { returnObjects: true }),
      cta: t('landing.pricing.professional.cta'),
      popular: true
    },
    {
      name: t('landing.pricing.enterprise.title'),
      price: t('landing.pricing.enterprise.price'),
      description: t('landing.pricing.enterprise.description'),
      features: t('landing.pricing.enterprise.features', { returnObjects: true }),
      cta: t('landing.pricing.enterprise.cta'),
      popular: false
    }
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('landing.pricing.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Choose the plan that works best for your property portfolio
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl overflow-hidden transition-all ${
                plan.popular 
                  ? 'border-2 border-primary shadow-elevated transform scale-105' 
                  : 'border border-neutral-200 shadow-card hover:shadow-elevated'
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white py-2 text-center text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-neutral-900">
                  {plan.name}
                </h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-neutral-900">
                    {plan.price}
                  </span>
                  {plan.unit && (
                    <span className="text-neutral-600 ml-2 pb-1">
                      {plan.unit}
                    </span>
                  )}
                </div>
                <p className="text-neutral-600 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check size={20} className="text-secondary mr-2 flex-shrink-0" />
                      <span className="text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link
                  to={plan.name === t('landing.pricing.enterprise.title') ? '/contact' : '/signup'}
                  className={`w-full text-center block transition-all ${
                    plan.popular
                      ? 'btn-primary shadow-lg hover:shadow-xl'
                      : 'btn-secondary shadow hover:shadow-md'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;