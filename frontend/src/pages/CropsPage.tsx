import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { CropStatus, CropType } from '../types';

// Mock data
const mockCrops = [
  {
    id: 1,
    name: 'طماطم',
    variety: 'هجين',
    crop_type: CropType.VEGETABLES,
    status: CropStatus.FLOWERING,
    planted_area_hectares: 2.5,
    expected_yield_kg: 5000,
    farm_name: 'المزرعة الشمالية',
    planting_date: '2024-01-15',
    expected_harvest_date: '2024-04-15',
  },
  {
    id: 2,
    name: 'قمح',
    variety: 'محلي',
    crop_type: CropType.CEREALS,
    status: CropStatus.VEGETATIVE,
    planted_area_hectares: 5.0,
    expected_yield_kg: 8000,
    farm_name: 'المزرعة الجنوبية',
    planting_date: '2024-01-10',
    expected_harvest_date: '2024-05-10',
  },
  {
    id: 3,
    name: 'خس',
    variety: 'أخضر',
    crop_type: CropType.VEGETABLES,
    status: CropStatus.MATURE,
    planted_area_hectares: 1.0,
    expected_yield_kg: 2000,
    farm_name: 'مزرعة الوادي',
    planting_date: '2024-01-20',
    expected_harvest_date: '2024-03-20',
  },
];

const getStatusColor = (status: CropStatus) => {
  switch (status) {
    case CropStatus.PLANNED:
      return 'badge-info';
    case CropStatus.PLANTED:
    case CropStatus.GERMINATED:
      return 'badge-warning';
    case CropStatus.VEGETATIVE:
    case CropStatus.FLOWERING:
    case CropStatus.FRUITING:
      return 'badge-success';
    case CropStatus.MATURE:
      return 'badge-success';
    case CropStatus.HARVESTED:
      return 'badge-info';
    case CropStatus.FAILED:
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const getStatusText = (status: CropStatus) => {
  switch (status) {
    case CropStatus.PLANNED:
      return 'مخطط';
    case CropStatus.PLANTED:
      return 'مزروع';
    case CropStatus.GERMINATED:
      return 'منبت';
    case CropStatus.VEGETATIVE:
      return 'نمو نباتي';
    case CropStatus.FLOWERING:
      return 'إزهار';
    case CropStatus.FRUITING:
      return 'إثمار';
    case CropStatus.MATURE:
      return 'ناضج';
    case CropStatus.HARVESTED:
      return 'محصود';
    case CropStatus.FAILED:
      return 'فاشل';
    default:
      return status;
  }
};

const getCropTypeText = (type: CropType) => {
  switch (type) {
    case CropType.CEREALS:
      return 'حبوب';
    case CropType.VEGETABLES:
      return 'خضروات';
    case CropType.FRUITS:
      return 'فواكه';
    case CropType.LEGUMES:
      return 'بقوليات';
    case CropType.HERBS:
      return 'أعشاب';
    case CropType.SPICES:
      return 'توابل';
    case CropType.OTHER:
      return 'أخرى';
    default:
      return type;
  }
};

export const CropsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المحاصيل</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة جميع المحاصيل الزراعية
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/crops/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 ml-2" />
            إضافة محصول جديد
          </Link>
        </div>
      </div>

      {/* Crops grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockCrops.map((crop) => (
          <Card key={crop.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {crop.name}
                </h3>
                <span className={`badge ${getStatusColor(crop.status)}`}>
                  {getStatusText(crop.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500">الصنف:</span>
                  <span className="mr-2 font-medium">{crop.variety}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">النوع:</span>
                  <span className="mr-2 font-medium">{getCropTypeText(crop.crop_type)}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">المزرعة:</span>
                  <span className="mr-2 font-medium">{crop.farm_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">المساحة</div>
                    <div className="font-medium">{crop.planted_area_hectares} هكتار</div>
                  </div>
                  <div>
                    <div className="text-gray-500">الإنتاج المتوقع</div>
                    <div className="font-medium">{crop.expected_yield_kg} كغ</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">تاريخ الزراعة</div>
                    <div className="font-medium">{crop.planting_date}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">تاريخ الحصاد المتوقع</div>
                    <div className="font-medium">{crop.expected_harvest_date}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="flex space-x-3 space-x-reverse">
                <Link
                  to={`/crops/${crop.id}`}
                  className="btn-outline flex-1 inline-flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Link>
                <Link
                  to={`/crops/${crop.id}/edit`}
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
      {mockCrops.length === 0 && (
        <Card className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد محاصيل</h3>
          <p className="mt-1 text-sm text-gray-500">
            ابدأ بإضافة محصول جديد لتتبع نموه وإنتاجه.
          </p>
          <div className="mt-6">
            <Link to="/crops/new" className="btn-primary">
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة محصول جديد
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};