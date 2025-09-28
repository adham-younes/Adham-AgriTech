import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BuildingOfficeIcon,
  CropIcon,
  CpuChipIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Mock data for demonstration
const mockStats = {
  farms_count: 5,
  total_crops: 23,
  active_sensors: 45,
  satellite_images: 12,
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'sensor',
    message: 'جهاز استشعار جديد تم تثبيته في المزرعة الشمالية',
    time: 'منذ ساعتين',
    status: 'success',
  },
  {
    id: 2,
    type: 'satellite',
    message: 'تم تحليل صورة قمر صناعي جديدة للمزرعة الجنوبية',
    time: 'منذ 4 ساعات',
    status: 'info',
  },
  {
    id: 3,
    type: 'crop',
    message: 'محصول القمح في مرحلة الإزهار',
    time: 'منذ 6 ساعات',
    status: 'warning',
  },
  {
    id: 4,
    type: 'alert',
    message: 'انخفاض في مستوى رطوبة التربة',
    time: 'منذ 8 ساعات',
    status: 'error',
  },
];

export const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-gray-500">
          نظرة عامة على نظام الزراعة الذكية
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  إجمالي المزارع
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {dashboardData?.farms_count || 0}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CropIcon className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  إجمالي المحاصيل
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {dashboardData?.total_crops || 0}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CpuChipIcon className="h-8 w-8 text-accent-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  أجهزة الاستشعار النشطة
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {dashboardData?.active_sensors || 0}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  صور الأقمار الصناعية
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {dashboardData?.satellite_images || 0}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">النشاط الأخير</h3>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-mb-8">
                {mockRecentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== mockRecentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 right-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3 space-x-reverse">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.status === 'success'
                                ? 'bg-green-500'
                                : activity.status === 'warning'
                                ? 'bg-yellow-500'
                                : activity.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          >
                            <span className="text-white text-xs font-medium">
                              {activity.type === 'sensor' ? 'S' : 
                               activity.type === 'satellite' ? '🛰️' :
                               activity.type === 'crop' ? '🌱' : '⚠️'}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.message}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Weather widget */}
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">الطقس الحالي</h3>
          </div>
          <div className="card-body">
            <div className="text-center">
              <div className="text-4xl mb-2">☀️</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">28°C</div>
              <div className="text-sm text-gray-500 mb-4">مشمس</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">الرطوبة</div>
                  <div className="font-medium">65%</div>
                </div>
                <div>
                  <div className="text-gray-500">سرعة الرياح</div>
                  <div className="font-medium">12 km/h</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};