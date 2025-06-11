import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BreadcrumbsProps {
  path: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path }) => {
  const { t } = useTranslation();
  
  // Skip empty segments and dashboard (since we're already in dashboard)
  const segments = path.split('/').filter(segment => segment && segment !== 'dashboard');
  
  if (segments.length === 0) {
    return null;
  }
  
  return (
    <nav className="text-sm">
      <ol className="flex items-center text-neutral-500">
        <li>
          <Link to="/dashboard" className="hover:text-primary">
            {t('nav.dashboard')}
          </Link>
        </li>
        
        {segments.map((segment, index) => {
          // Create path up to current segment
          const segmentPath = `/dashboard/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          
          // Capitalize the first letter and replace hyphens with spaces
          const formattedSegment = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
          
          const navKey = segment.toLowerCase() as keyof typeof t.nav;
          const segmentName = t(`nav.${navKey}`, formattedSegment);
          
          return (
            <li key={segment} className="flex items-center">
              <ChevronRight size={14} className="mx-1" />
              {isLast ? (
                <span className="text-neutral-700 font-medium">
                  {segmentName}
                </span>
              ) : (
                <Link to={segmentPath} className="hover:text-primary">
                  {segmentName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;