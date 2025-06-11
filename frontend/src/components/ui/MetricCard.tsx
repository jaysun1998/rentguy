import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon,
  trend,
  isLoading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="text-primary">{icon}</div>
        
        {isLoading ? (
          <div className="h-6 w-16 bg-neutral-200 animate-pulse rounded"></div>
        ) : trend ? (
          <div className={`text-sm font-medium flex items-center ${trend.isPositive ? 'text-secondary' : 'text-error'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              className="ml-1" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M8 4L12 8L8 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                transform={trend.isPositive ? "rotate(0 8 8)" : "rotate(180 8 8)"}
              />
            </svg>
          </div>
        ) : null}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-neutral-600 font-medium">{title}</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;