import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Users, CreditCard, Wrench, Globe, Shield, FileMusic as DeviceMobile, FileText } from 'lucide-react';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Building2 size={24} />,
      title: t('landing.features.propertyManagement.title'),
      description: t('landing.features.propertyManagement.description'),
      color: 'primary'
    },
    {
      icon: <Users size={24} />,
      title: t('landing.features.tenantManagement.title'),
      description: t('landing.features.tenantManagement.description'),
      color: 'secondary'
    },
    {
      icon: <CreditCard size={24} />,
      title: t('landing.features.financialTools.title'),
      description: t('landing.features.financialTools.description'),
      color: 'warning'
    },
    {
      icon: <Wrench size={24} />,
      title: t('landing.features.maintenance.title'),
      description: t('landing.features.maintenance.description'),
      color: 'error'
    },
    {
      icon: <Globe size={24} />,
      title: "Multi-Country Support",
      description: "Manage properties across different European countries with localized compliance and tax regulations.",
      color: 'primary'
    },
    {
      icon: <Shield size={24} />,
      title: "GDPR Compliance",
      description: "Built-in data protection features ensuring your property management stays compliant with EU regulations.",
      color: 'secondary'
    },
    {
      icon: <DeviceMobile size={24} />,
      title: "Mobile App",
      description: "Manage your properties on the go with our powerful mobile application for iOS and Android.",
      color: 'warning'
    },
    {
      icon: <FileText size={24} />,
      title: "Document Management",
      description: "Secure storage and management of all your property-related documents and contracts.",
      color: 'error'
    }
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Modern Property Management
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Everything you need to manage your properties across Europe, from tenant screening to financial reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-card hover:shadow-elevated transition-all"
            >
              <div className={`w-12 h-12 rounded-full bg-${feature.color}-100 flex items-center justify-center text-${feature.color} mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">
                {feature.title}
              </h3>
              <p className="text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;