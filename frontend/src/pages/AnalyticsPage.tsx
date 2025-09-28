import React from 'react';
import { ChartBarIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';

// Mock data for charts
const mockChartData = {
  cropGrowth: [
    { month: 'يناير', value: 65 },
    { month: 'فبراير', value: 72 },
    { month: 'مارس', value: 78 },
    { month: 'أبريل', value: 85 },
    { month: 'مايو', value: 88 },
    { month: 'يونيو', value: 92 },
  ],
  sensorData: [
    { time: '00:00', temperature: 22, humidity: 65, soilMoisture: 45 },
    { time: '04:00', temperature: 20, humidity: 70, soilMoisture: 47 },
    { time: '08:00', temperature: 25, humidity: 60, soilMoisture: 43 },
    { time: '12:00', temperature: 30, humidity: 55, soilMoisture: 40 },
    { time: '16:00', temperature: 28, humidity: 58, soilMoisture: 42 },
    { time: '20:00', temperature: 24, humidity: 62, soilMoisture: 44 },
  ],
  farmPerformance: [
    { farm: 'المزرعة الشمالية', yield: 85, efficiency: 92, health: 88 },
    { farm: 'المزرعة الجنوبية', yield: 78, efficiency: 85, health: 82 },
    { farm: 'مزرعة الوادي', yield: 92, efficiency: 88, health: 90 },
  ],
};

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التحليلات والتقارير</h1>
        <p className="mt-1 text-sm text-gray-500">
          تحليل شامل لأداء المزارع والمحاصيل
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  متوسط الإنتاجية
                </dt>
                <dd className="text-lg font-medium text-gray-900">+12.5%</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  كفاءة الري
                </dt>
                <dd className="text-lg font-medium text-gray-900">88.3%</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDownIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="mr-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  استهلاك المياه
                </dt>
                <dd className="text-lg font-medium text-gray-900">-8.2%</dd>
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
                  صحة المحاصيل
                </dt>
                <dd className="text-lg font-medium text-gray-900">91.7%</dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Crop growth chart */}
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">نمو المحاصيل</h3>
          </div>
          <div className="card-body">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">رسم بياني لنمو المحاصيل</p>
                <p className="text-sm text-gray-400">سيتم عرض الرسم البياني هنا</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sensor data chart */}
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">بيانات أجهزة الاستشعار</h3>
          </div>
          <div className="card-body">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">رسم بياني لبيانات الاستشعار</p>
                <p className="text-sm text-gray-400">سيتم عرض الرسم البياني هنا</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Farm performance table */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">أداء المزارع</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المزرعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإنتاجية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكفاءة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصحة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockChartData.farmPerformance.map((farm, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {farm.farm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${farm.yield}%` }}
                          ></div>
                        </div>
                        {farm.yield}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${farm.efficiency}%` }}
                          ></div>
                        </div>
                        {farm.efficiency}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${farm.health}%` }}
                          ></div>
                        </div>
                        {farm.health}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Insights and recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">الرؤى الرئيسية</h3>
          </div>
          <div className="card-body">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    زيادة في إنتاجية المحاصيل بنسبة 12.5% هذا الشهر
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    تحسن في كفاءة استخدام المياه بنسبة 8.2%
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    انخفاض في صحة المحاصيل في المنطقة الجنوبية
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">التوصيات</h3>
          </div>
          <div className="card-body">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    زيادة معدل الري في المنطقة الجنوبية
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    تثبيت أجهزة استشعار إضافية في المزرعة الشمالية
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-gray-900">
                    مراجعة جدول التسميد للمحاصيل
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};