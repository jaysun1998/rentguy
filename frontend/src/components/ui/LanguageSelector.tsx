import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  onClose: () => void;
  isMobile?: boolean;
  dark?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  onClose, 
  isMobile = false,
  dark = false
}) => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    onClose();
  };

  const baseClasses = "absolute z-20 rounded-md shadow-lg animate-fade-in";
  const darkClasses = dark ? "bg-neutral-700" : "bg-white";
  const darkTextClasses = dark ? "text-neutral-200 hover:bg-neutral-600" : "text-neutral-700 hover:bg-neutral-100";
  
  const positionClasses = isMobile 
    ? "left-0 right-0 mx-4" 
    : "right-0 w-40 mt-2";
  
  return (
    <div 
      className={`${baseClasses} ${darkClasses} ${positionClasses}`}
      onBlur={onClose}
    >
      <div className="py-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center w-full px-4 py-2 text-sm ${darkTextClasses} ${i18n.language === language.code ? 'font-medium' : ''}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
            {i18n.language === language.code && (
              <span className="ml-auto">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;