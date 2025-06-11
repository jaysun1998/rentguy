import React from 'react';
import classNames from 'classnames';

type BadgeType = 'success' | 'warning' | 'error' | 'neutral' | 'primary';

interface BadgeProps {
  type: BadgeType;
  label: string;
}

const Badge: React.FC<BadgeProps> = ({ type, label }) => {
  const badgeClasses = classNames('badge', {
    'badge-success': type === 'success',
    'badge-warning': type === 'warning',
    'badge-error': type === 'error',
    'badge-neutral': type === 'neutral',
    'bg-primary-100 text-primary-600': type === 'primary',
  });

  return (
    <span className={badgeClasses}>
      {label}
    </span>
  );
};

export default Badge;