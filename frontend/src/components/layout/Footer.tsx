import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import LanguageSelector from '../ui/LanguageSelector';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);

  return (
    <footer className="bg-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size="lg" inverted />
            <p className="mt-3 text-sm text-neutral-300">
              The complete solution for managing properties, tenants, and finances across Europe.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-neutral-300 hover:text-white text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-white text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-neutral-300 hover:text-white text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="text-neutral-300 hover:text-white text-sm">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-300 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="text-neutral-300 hover:text-white text-sm">
                  Property Management Glossary
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-neutral-300 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-300 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-neutral-300 hover:text-white text-sm">
                  GDPR Compliance
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <button
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                className="flex items-center text-neutral-300 hover:text-white text-sm"
              >
                <span>Select Language</span>
              </button>
              {isLanguageSelectorOpen && (
                <LanguageSelector onClose={() => setIsLanguageSelectorOpen(false)} dark />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-700">
          <p className="text-sm text-neutral-400 text-center">
            &copy; {new Date().getFullYear()} PropertyPro Europe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;