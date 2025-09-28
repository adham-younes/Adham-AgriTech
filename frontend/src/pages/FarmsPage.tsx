import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MapIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Mock data
const mockFarms = [
  {
    id: 1,
    name: 'المزرعة الشمالية',
    location: 'الرياض، المملكة العربية السعودية',
    area_hectares: 25.5,
    status: 'active',
    crops_count: 8,
    sensors_count: 12,
    last_update: 'منذ ساعتين',
  },
  {
    id: 2,
    name: 'المزرعة الجنوبية',
    location: 'الدمام، المملكة العربية السعودية',
    area_hectares: 18.2,
    status: 'active',
    crops_count: 5,
    sensors_count: 8,
    last_update: 'منذ 4 ساعات',
  },
  {
    id: 3,
    name: 'مزرعة الوادي',
    location: 'الطائف، المملكة العربية السعودية',
    area_hectares: 32.1,
    status: 'maintenance',
    crops_count: 12,
    sensors_count: 15,
    last_update: 'منذ يوم',
  },
];

export const FarmsPage: React.FC = () => {
  const isLoading = false; // This would come from a query

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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المزارع</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة جميع المزارع والمناطق الزراعية
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/farms/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 ml-2" />
            إضافة مزرعة جديدة
          </Link>
        </div>
      </div>

      {/* Farms grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockFarms.map((farm) => (
          <Card key={farm.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {farm.name}
                </h3>
                <span
                  className={`badge ${
                    farm.status === 'active'
                      ? 'badge-success'
                      : farm.status === 'maintenance'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {farm.status === 'active' ? 'نشطة' : 
                   farm.status === 'maintenance' ? 'صيانة' : 'غير نشطة'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <MapIcon className="h-4 w-4 ml-2" />
                  {farm.location}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">المساحة</div>
                    <div className="font-medium">{farm.area_hectares} هكتار</div>
                  </div>
                  <div>
                    <div className="text-gray-500">المحاصيل</div>
                    <div className="font-medium">{farm.crops_count}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">أجهزة الاستشعار</div>
                    <div className="font-medium">{farm.sensors_count}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">آخر تحديث</div>
                    <div className="font-medium">{farm.last_update}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="flex space-x-3 space-x-reverse">
                <Link
                  to={`/farms/${farm.id}`}
                  className="btn-outline flex-1 inline-flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Link>
                <Link
                  to={`/farms/${farm.id}/edit`}
                  className="btn-primary flex-1 inline-flex items-center justify-center"
                >
                  تعديل
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {mockFarms.length === 0 && (
        <Card className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <MapIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مزارع</h3>
          <p className="mt-1 text-sm text-gray-500">
            ابدأ بإنشاء مزرعة جديدة لإدارة عملياتك الزراعية.
          </p>
          <div className="mt-6">
            <Link to="/farms/new" className="btn-primary">
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة مزرعة جديدة
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};