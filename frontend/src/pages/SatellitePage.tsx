import React from 'react';
import { SatelliteIcon, EyeIcon, DownloadIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { SatelliteType, DataType } from '../types';

// Mock data
const mockSatelliteData = [
  {
    id: 1,
    satellite_type: SatelliteType.SENTINEL_2,
    data_type: DataType.OPTICAL,
    acquisition_date: '2024-01-20',
    cloud_coverage: 5.2,
    farm_name: 'المزرعة الشمالية',
    resolution_meters: 10,
    quality_score: 95,
    is_processed: true,
    thumbnail_url: '/api/placeholder/300/200',
  },
  {
    id: 2,
    satellite_type: SatelliteType.LANDSAT_8,
    data_type: DataType.MULTISPECTRAL,
    acquisition_date: '2024-01-18',
    cloud_coverage: 12.8,
    farm_name: 'المزرعة الجنوبية',
    resolution_meters: 30,
    quality_score: 88,
    is_processed: true,
    thumbnail_url: '/api/placeholder/300/200',
  },
  {
    id: 3,
    satellite_type: SatelliteType.SENTINEL_1,
    data_type: DataType.RADAR,
    acquisition_date: '2024-01-15',
    cloud_coverage: 0,
    farm_name: 'مزرعة الوادي',
    resolution_meters: 5,
    quality_score: 92,
    is_processed: false,
    thumbnail_url: '/api/placeholder/300/200',
  },
];

const getSatelliteTypeText = (type: SatelliteType) => {
  switch (type) {
    case SatelliteType.SENTINEL_2:
      return 'Sentinel-2';
    case SatelliteType.SENTINEL_1:
      return 'Sentinel-1';
    case SatelliteType.LANDSAT_8:
      return 'Landsat 8';
    case SatelliteType.LANDSAT_9:
      return 'Landsat 9';
    case SatelliteType.MODIS:
      return 'MODIS';
    case SatelliteType.SPOT:
      return 'SPOT';
    case SatelliteType.PLEIADES:
      return 'Pleiades';
    case SatelliteType.WORLDVIEW:
      return 'WorldView';
    case SatelliteType.OTHER:
      return 'أخرى';
    default:
      return type;
  }
};

const getDataTypeText = (type: DataType) => {
  switch (type) {
    case DataType.OPTICAL:
      return 'بصري';
    case DataType.RADAR:
      return 'رادار';
    case DataType.THERMAL:
      return 'حراري';
    case DataType.MULTISPECTRAL:
      return 'متعدد الأطياف';
    case DataType.HYPERSPECTRAL:
      return 'فائق الأطياف';
    default:
      return type;
  }
};

const getQualityColor = (score: number) => {
  if (score >= 90) return 'badge-success';
  if (score >= 70) return 'badge-warning';
  return 'badge-danger';
};

const getCloudCoverageColor = (coverage: number) => {
  if (coverage <= 10) return 'text-green-600';
  if (coverage <= 30) return 'text-yellow-600';
  return 'text-red-600';
};

export const SatellitePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الأقمار الصناعية</h1>
        <p className="mt-1 text-sm text-gray-500">
          مراقبة المزارع عبر صور الأقمار الصناعية
        </p>
      </div>

      {/* Satellite data grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockSatelliteData.map((data) => (
          <Card key={data.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
              {/* Image thumbnail */}
              <div className="mb-4">
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <SatelliteIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">صورة القمر الصناعي</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getSatelliteTypeText(data.satellite_type)}
                  </h3>
                  <span className={`badge ${getQualityColor(data.quality_score)}`}>
                    {data.quality_score}%
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">النوع:</span>
                  <span className="mr-2 font-medium">{getDataTypeText(data.data_type)}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">المزرعة:</span>
                  <span className="mr-2 font-medium">{data.farm_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">تاريخ التصوير</div>
                    <div className="font-medium">{data.acquisition_date}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">دقة الصورة</div>
                    <div className="font-medium">{data.resolution_meters}m</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">الغطاء السحابي</div>
                    <div className={`font-medium ${getCloudCoverageColor(data.cloud_coverage)}`}>
                      {data.cloud_coverage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">حالة المعالجة</div>
                    <div className="font-medium">
                      {data.is_processed ? 'مُعالج' : 'غير مُعالج'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="flex space-x-3 space-x-reverse">
                <button className="btn-outline flex-1 inline-flex items-center justify-center">
                  <EyeIcon className="h-4 w-4 ml-2" />
                  عرض
                </button>
                <button className="btn-primary flex-1 inline-flex items-center justify-center">
                  <DownloadIcon className="h-4 w-4 ml-2" />
                  تحميل
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analysis results */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">نتائج التحليل</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0.75</div>
              <div className="text-sm text-gray-500">مؤشر NDVI</div>
              <div className="text-xs text-gray-400">غطاء نباتي جيد</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0.45</div>
              <div className="text-sm text-gray-500">مؤشر NDWI</div>
              <div className="text-xs text-gray-400">رطوبة متوسطة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">85%</div>
              <div className="text-sm text-gray-500">صحة المحاصيل</div>
              <div className="text-xs text-gray-400">حالة جيدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-500">مناطق الإجهاد</div>
              <div className="text-xs text-gray-400">تحتاج مراجعة</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Request new imagery */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">طلب صور جديدة</h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-500 mb-4">
            يمكنك طلب صور جديدة من الأقمار الصناعية لمزارعك
          </p>
          <button className="btn-primary">
            <SatelliteIcon className="h-4 w-4 ml-2" />
            طلب صور جديدة
          </button>
        </div>
      </Card>
    </div>
  );
};