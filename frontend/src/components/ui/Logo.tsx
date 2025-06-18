import React from 'react';
import { Building } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', iconOnly = false, inverted = false }) => {
  const textColorClass = inverted ? 'text-white' : 'text-neutral-900';
  const iconColorClass = 'text-primary';
  
  const sizes = {
    sm: {
      icon: 20,
      text: 'text-sm',
    },
    md: {
      icon: 24,
      text: 'text-lg',
    },
    lg: {
      icon: 32,
      text: 'text-2xl',
    },
  };

  return (
    <div className="flex items-center">
      <div className={`${iconColorClass}`}>
        <Building size={sizes[size].icon} />
      </div>
      {!iconOnly && (
        <span className={`ml-2 font-semibold ${sizes[size].text} ${textColorClass}`}>
          RentGuy
        </span>
      )}
    </div>
  );
};

export default Logo;