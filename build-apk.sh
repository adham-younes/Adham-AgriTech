#!/bin/bash

# Adham AgriTech - Android APK Build Script
# هذا السكريبت يقوم ببناء تطبيق Android APK

echo "🚀 بدء بناء تطبيق Adham AgriTech للـ Android..."

# التحقق من وجود Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ خطأ: ANDROID_HOME غير محدد"
    echo "يرجى تثبيت Android SDK وتحديد متغير ANDROID_HOME"
    exit 1
fi

# إنشاء مجلد البناء
mkdir -p android-app/build
cd android-app

# تنظيف البناء السابق
echo "🧹 تنظيف البناء السابق..."
./gradlew clean

# بناء APK
echo "🔨 بناء APK..."
./gradlew assembleDebug

# التحقق من نجاح البناء
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ تم بناء APK بنجاح!"
    
    # نسخ APK إلى المجلد الرئيسي
    cp app/build/outputs/apk/debug/app-debug.apk ../AdhamAgriTech-v1.0.0.apk
    
    echo "📱 APK جاهز للتثبيت: AdhamAgriTech-v1.0.0.apk"
    echo ""
    echo "📋 معلومات التطبيق:"
    echo "   - اسم التطبيق: Adham AgriTech"
    echo "   - الإصدار: 1.0.0"
    echo "   - الحجم: $(du -h ../AdhamAgriTech-v1.0.0.apk | cut -f1)"
    echo "   - نظام التشغيل: Android 5.0+ (API 21+)"
    echo ""
    echo "🔧 كيفية التثبيت:"
    echo "   1. انقل ملف APK إلى هاتفك"
    echo "   2. فعّل 'مصادر غير معروفة' في إعدادات الأمان"
    echo "   3. اضغط على ملف APK للتثبيت"
    echo ""
    echo "📞 الدعم: info@adham-agritech.com"
    
else
    echo "❌ فشل في بناء APK"
    echo "يرجى التحقق من الأخطاء أعلاه"
    exit 1
fi

cd ..
echo "🎉 تم الانتهاء من بناء التطبيق!"