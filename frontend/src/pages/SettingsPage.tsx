import React from 'react';
import { UserIcon, BellIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة إعدادات الحساب والتطبيق
        </p>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile settings */}
        <Card>
          <div className="card-header">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">الملف الشخصي</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="label">الاسم الكامل</label>
                <input
                  type="text"
                  className="input"
                  defaultValue={user?.full_name}
                />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input"
                  defaultValue={user?.email}
                />
              </div>
              <div>
                <label className="label">رقم الهاتف</label>
                <input
                  type="tel"
                  className="input"
                  defaultValue={user?.phone || ''}
                />
              </div>
              <div>
                <label className="label">الموقع</label>
                <input
                  type="text"
                  className="input"
                  defaultValue={user?.location || ''}
                />
              </div>
              <div>
                <label className="label">نبذة شخصية</label>
                <textarea
                  className="input"
                  rows={3}
                  defaultValue={user?.bio || ''}
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-primary">حفظ التغييرات</button>
          </div>
        </Card>

        {/* Notification settings */}
        <Card>
          <div className="card-header">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-gray-400 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">الإشعارات</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">إشعارات البريد الإلكتروني</h4>
                  <p className="text-sm text-gray-500">تلقي إشعارات عبر البريد الإلكتروني</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">تنبيهات أجهزة الاستشعار</h4>
                  <p className="text-sm text-gray-500">إشعارات عند حدوث مشاكل في أجهزة الاستشعار</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">تحديثات الأقمار الصناعية</h4>
                  <p className="text-sm text-gray-500">إشعارات عند توفر صور جديدة</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">تقارير أسبوعية</h4>
                  <p className="text-sm text-gray-500">تلقي تقارير أسبوعية عن أداء المزارع</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-primary">حفظ الإعدادات</button>
          </div>
        </Card>

        {/* Security settings */}
        <Card>
          <div className="card-header">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">الأمان</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="label">كلمة المرور الحالية</label>
                <input
                  type="password"
                  className="input"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>
              <div>
                <label className="label">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  className="input"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              <div>
                <label className="label">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  className="input"
                  placeholder="أكد كلمة المرور الجديدة"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">المصادقة الثنائية</h4>
                  <p className="text-sm text-gray-500">إضافة طبقة أمان إضافية لحسابك</p>
                </div>
                <button className="btn-outline">تفعيل</button>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-primary">تحديث كلمة المرور</button>
          </div>
        </Card>

        {/* Application settings */}
        <Card>
          <div className="card-header">
            <div className="flex items-center">
              <CogIcon className="h-5 w-5 text-gray-400 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">إعدادات التطبيق</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="label">اللغة</label>
                <select className="input">
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="label">المنطقة الزمنية</label>
                <select className="input">
                  <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                  <option value="Asia/Dubai">دبي (GMT+4)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
              <div>
                <label className="label">وحدات القياس</label>
                <select className="input">
                  <option value="metric">متري (كيلومتر، كيلوغرام)</option>
                  <option value="imperial">إمبراطوري (ميل، رطل)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">الوضع المظلم</h4>
                  <p className="text-sm text-gray-500">استخدام الواجهة المظلمة</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-primary">حفظ الإعدادات</button>
          </div>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="border-red-200">
        <div className="card-header bg-red-50">
          <h3 className="text-lg font-medium text-red-900">منطقة الخطر</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">حذف الحساب</h4>
              <p className="text-sm text-gray-500">
                حذف حسابك نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <button className="btn-danger">
              حذف الحساب
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};