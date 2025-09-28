import React from 'react';
import { NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CropIcon,
  CpuChipIcon,
  SatelliteIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon },
  { name: 'المزارع', href: '/farms', icon: BuildingOfficeIcon },
  { name: 'المحاصيل', href: '/crops', icon: CropIcon },
  { name: 'أجهزة الاستشعار', href: '/sensors', icon: CpuChipIcon },
  { name: 'الأقمار الصناعية', href: '/satellite', icon: SatelliteIcon },
  { name: 'التحليلات', href: '/analytics', icon: ChartBarIcon },
  { name: 'الإعدادات', href: '/settings', icon: CogIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
              <div className="mr-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Adham AgriTech
                </h2>
              </div>
            </div>
            
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="sr-only">إغلاق القائمة</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon
                  className={clsx(
                    'ml-3 h-5 w-5 flex-shrink-0',
                    'text-gray-400 group-hover:text-gray-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Adham AgriTech v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};