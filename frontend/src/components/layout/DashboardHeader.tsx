import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronLeft, ChevronRight, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../ui/Breadcrumbs';

interface DashboardHeaderProps {
  title: string;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  toggleSidebar, 
  isSidebarCollapsed 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-neutral-600 hover:text-neutral-900"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
            <Breadcrumbs path={location.pathname} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-300"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>

          <button className="relative text-neutral-600 hover:text-neutral-900">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-error text-white text-xs flex items-center justify-center rounded-full">
              2
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 animate-fade-in">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;