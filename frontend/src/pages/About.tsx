import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Globe, Users, Award } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      value: '10+',
      label: 'Countries',
      icon: <Globe size={24} />
    },
    {
      value: '1000+',
      label: 'Properties Managed',
      icon: <Building2 size={24} />
    },
    {
      value: '5000+',
      label: 'Happy Tenants',
      icon: <Users size={24} />
    },
    {
      value: '98%',
      label: 'Customer Satisfaction',
      icon: <Award size={24} />
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      image: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg',
      bio: 'Former PropTech executive with 15+ years of experience in European real estate markets.'
    },
    {
      name: 'Marcus Schmidt',
      role: 'Chief Technology Officer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      bio: 'Tech veteran with expertise in building scalable SaaS platforms and AI solutions.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Head of Operations',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
      bio: 'Operations specialist focused on streamlining property management processes across Europe.'
    },
    {
      name: 'Thomas Weber',
      role: 'Head of Customer Success',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
      bio: 'Dedicated to ensuring our customers get the most value from our platform.'
    }
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-primary-600/90 to-primary-700/90" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Property Management Across Europe
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Our mission is to simplify property management and create better living experiences through technology.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-elevated p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
              <div className="text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Mission</h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            PropertyPro Europe was founded with a clear vision: to revolutionize property management across Europe. 
            We understand the unique challenges of managing properties across different countries, languages, and regulations. 
            Our platform brings together cutting-edge technology and local expertise to create a seamless experience for property managers and tenants alike.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Our diverse team brings together expertise in real estate, technology, and customer success to deliver the best property management solution in Europe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-neutral-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Join Our Team</h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            We're always looking for talented individuals who are passionate about revolutionizing property management.
          </p>
          <Link
            to="/careers"
            className="btn-primary shadow-lg hover:shadow-xl transition-all"
          >
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;