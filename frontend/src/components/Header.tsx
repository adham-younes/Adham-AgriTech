import React from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">فتح القائمة</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Adham AgriTech
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">عرض الإشعارات</span>
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User menu */}
            <div className="relative">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  onClick={logout}
                >
                  <span className="sr-only">تسجيل الخروج</span>
                  <UserCircleIcon className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};