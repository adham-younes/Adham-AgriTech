import React from 'react';
import { useParams } from 'react-router-dom';
import { MapIcon, CropIcon, CpuChipIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const FarmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isLoading = false; // This would come from a query

  // Mock data
  const mockFarm = {
    id: parseInt(id || '1'),
    name: 'المزرعة الشمالية',
    location: 'الرياض، المملكة العربية السعودية',
    area_hectares: 25.5,
    status: 'active',
    soil_type: 'طيني',
    climate_zone: 'صحراوي',
    irrigation_system: 'ري بالتنقيط',
    description: 'مزرعة متخصصة في زراعة الخضروات والفواكه باستخدام أحدث التقنيات الزراعية.',
    crops_count: 8,
    sensors_count: 12,
    satellite_images: 5,
    created_at: '2024-01-15',
  };

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
        <h1 className="text-2xl font-bold text-gray-900">{mockFarm.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {mockFarm.location}
        </p>
      </div>

      {/* Farm overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">معلومات المزرعة</h3>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">المساحة</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockFarm.area_hectares} هكتار</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">نوع التربة</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockFarm.soil_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">المنطقة المناخية</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockFarm.climate_zone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">نظام الري</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockFarm.irrigation_system}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">الوصف</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mockFarm.description}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CropIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    المحاصيل
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockFarm.crops_count}
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
                    أجهزة الاستشعار
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockFarm.sensors_count}
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
                    {mockFarm.satellite_images}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Map placeholder */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">موقع المزرعة</h3>
        </div>
        <div className="card-body">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">خريطة المزرعة</p>
              <p className="text-sm text-gray-400">سيتم عرض الخريطة هنا</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent activity */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">النشاط الأخير</h3>
        </div>
        <div className="card-body">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 right-4 -ml-px h-full w-0.5 bg-gray-200" />
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white text-xs font-medium">S</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          تم تثبيت جهاز استشعار جديد لرطوبة التربة
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        منذ ساعتين
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 right-4 -ml-px h-full w-0.5 bg-gray-200" />
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white text-xs font-medium">🛰️</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          تم تحليل صورة قمر صناعي جديدة
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        منذ 4 ساعات
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white text-xs font-medium">🌱</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          محصول الطماطم في مرحلة الإزهار
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        منذ 6 ساعات
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};