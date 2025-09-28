import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, SignalIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { SensorType, SensorStatus } from '../types';

// Mock data
const mockSensors = [
  {
    id: 1,
    name: 'مستشعر رطوبة التربة - المنطقة أ',
    sensor_type: SensorType.SOIL_MOISTURE,
    status: SensorStatus.ACTIVE,
    is_online: true,
    battery_level: 85,
    signal_strength: -65,
    farm_name: 'المزرعة الشمالية',
    last_reading: 'منذ 5 دقائق',
    value: 45.2,
    unit: '%',
  },
  {
    id: 2,
    name: 'مستشعر درجة الحرارة',
    sensor_type: SensorType.TEMPERATURE,
    status: SensorStatus.ACTIVE,
    is_online: true,
    battery_level: 92,
    signal_strength: -58,
    farm_name: 'المزرعة الجنوبية',
    last_reading: 'منذ دقيقتين',
    value: 28.5,
    unit: '°C',
  },
  {
    id: 3,
    name: 'مستشعر الرطوبة الجوية',
    sensor_type: SensorType.HUMIDITY,
    status: SensorStatus.MAINTENANCE,
    is_online: false,
    battery_level: 15,
    signal_strength: -85,
    farm_name: 'مزرعة الوادي',
    last_reading: 'منذ ساعة',
    value: 65.8,
    unit: '%',
  },
];

const getSensorTypeText = (type: SensorType) => {
  switch (type) {
    case SensorType.TEMPERATURE:
      return 'درجة الحرارة';
    case SensorType.HUMIDITY:
      return 'الرطوبة';
    case SensorType.SOIL_MOISTURE:
      return 'رطوبة التربة';
    case SensorType.SOIL_PH:
      return 'حموضة التربة';
    case SensorType.LIGHT:
      return 'الإضاءة';
    case SensorType.PRESSURE:
      return 'الضغط';
    case SensorType.WIND_SPEED:
      return 'سرعة الرياح';
    case SensorType.WIND_DIRECTION:
      return 'اتجاه الرياح';
    case SensorType.RAINFALL:
      return 'الأمطار';
    case SensorType.NUTRIENT_LEVEL:
      return 'مستوى المغذيات';
    case SensorType.PEST_DETECTION:
      return 'كشف الآفات';
    case SensorType.CAMERA:
      return 'كاميرا';
    case SensorType.OTHER:
      return 'أخرى';
    default:
      return type;
  }
};

const getStatusColor = (status: SensorStatus, isOnline: boolean) => {
  if (!isOnline) return 'badge-danger';
  
  switch (status) {
    case SensorStatus.ACTIVE:
      return 'badge-success';
    case SensorStatus.INACTIVE:
      return 'badge-warning';
    case SensorStatus.MAINTENANCE:
      return 'badge-warning';
    case SensorStatus.ERROR:
      return 'badge-danger';
    case SensorStatus.OFFLINE:
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const getStatusText = (status: SensorStatus, isOnline: boolean) => {
  if (!isOnline) return 'غير متصل';
  
  switch (status) {
    case SensorStatus.ACTIVE:
      return 'نشط';
    case SensorStatus.INACTIVE:
      return 'غير نشط';
    case SensorStatus.MAINTENANCE:
      return 'صيانة';
    case SensorStatus.ERROR:
      return 'خطأ';
    case SensorStatus.OFFLINE:
      return 'غير متصل';
    default:
      return status;
  }
};

const getBatteryColor = (level: number) => {
  if (level > 50) return 'text-green-600';
  if (level > 20) return 'text-yellow-600';
  return 'text-red-600';
};

const getSignalColor = (strength: number) => {
  if (strength > -60) return 'text-green-600';
  if (strength > -80) return 'text-yellow-600';
  return 'text-red-600';
};

export const SensorsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أجهزة الاستشعار</h1>
          <p className="mt-1 text-sm text-gray-500">
            مراقبة وإدارة جميع أجهزة الاستشعار
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/sensors/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 ml-2" />
            إضافة جهاز استشعار
          </Link>
        </div>
      </div>

      {/* Sensors grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockSensors.map((sensor) => (
          <Card key={sensor.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {sensor.name}
                </h3>
                <span className={`badge ${getStatusColor(sensor.status, sensor.is_online)}`}>
                  {getStatusText(sensor.status, sensor.is_online)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500">النوع:</span>
                  <span className="mr-2 font-medium">{getSensorTypeText(sensor.sensor_type)}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">المزرعة:</span>
                  <span className="mr-2 font-medium">{sensor.farm_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">آخر قراءة</div>
                    <div className="font-medium">{sensor.last_reading}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">القيمة الحالية</div>
                    <div className="font-medium">{sensor.value} {sensor.unit}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">مستوى البطارية</div>
                    <div className={`font-medium ${getBatteryColor(sensor.battery_level)}`}>
                      {sensor.battery_level}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">قوة الإشارة</div>
                    <div className={`font-medium flex items-center ${getSignalColor(sensor.signal_strength)}`}>
                      <SignalIcon className="h-4 w-4 ml-1" />
                      {sensor.signal_strength} dBm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="flex space-x-3 space-x-reverse">
                <Link
                  to={`/sensors/${sensor.id}`}
                  className="btn-outline flex-1 inline-flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Link>
                <Link
                  to={`/sensors/${sensor.id}/edit`}
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
      {mockSensors.length === 0 && (
        <Card className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أجهزة استشعار</h3>
          <p className="mt-1 text-sm text-gray-500">
            ابدأ بإضافة جهاز استشعار لمراقبة مزرعتك.
          </p>
          <div className="mt-6">
            <Link to="/sensors/new" className="btn-primary">
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة جهاز استشعار
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};