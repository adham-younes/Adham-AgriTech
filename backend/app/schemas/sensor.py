"""
Sensor schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.sensor import SensorType, SensorStatus


class SensorBase(BaseModel):
    """Base sensor schema"""
    name: str = Field(..., description="اسم جهاز الاستشعار")
    description: Optional[str] = Field(None, description="وصف جهاز الاستشعار")
    device_id: str = Field(..., description="معرف الجهاز الفريد")
    sensor_type: SensorType = Field(..., description="نوع جهاز الاستشعار")
    manufacturer: Optional[str] = Field(None, description="الشركة المصنعة")
    model: Optional[str] = Field(None, description="موديل الجهاز")
    
    # Location
    latitude: Optional[float] = Field(None, description="خط العرض")
    longitude: Optional[float] = Field(None, description="خط الطول")
    altitude: Optional[float] = Field(None, description="الارتفاع")
    installation_date: Optional[datetime] = Field(None, description="تاريخ التثبيت")
    
    # Configuration
    measurement_unit: Optional[str] = Field(None, description="وحدة القياس")
    min_value: Optional[float] = Field(None, description="القيمة الدنيا")
    max_value: Optional[float] = Field(None, description="القيمة العليا")
    accuracy: Optional[float] = Field(None, description="دقة القياس")
    calibration_date: Optional[datetime] = Field(None, description="تاريخ المعايرة")
    
    # Status
    status: SensorStatus = Field(SensorStatus.ACTIVE, description="حالة الجهاز")
    is_online: bool = Field(True, description="هل الجهاز متصل")
    battery_level: Optional[float] = Field(None, description="مستوى البطارية")
    signal_strength: Optional[float] = Field(None, description="قوة الإشارة")
    
    # Communication
    communication_protocol: Optional[str] = Field(None, description="بروتوكول الاتصال")
    data_transmission_interval: Optional[int] = Field(None, description="فترة إرسال البيانات بالثواني")
    
    # Additional configuration
    configuration: Optional[Dict[str, Any]] = Field(None, description="إعدادات إضافية")


class SensorCreate(SensorBase):
    """Schema for creating a sensor"""
    farm_id: int = Field(..., description="معرف المزرعة")


class SensorUpdate(BaseModel):
    """Schema for updating a sensor"""
    name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    installation_date: Optional[datetime] = None
    measurement_unit: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    accuracy: Optional[float] = None
    calibration_date: Optional[datetime] = None
    status: Optional[SensorStatus] = None
    is_online: Optional[bool] = None
    battery_level: Optional[float] = None
    signal_strength: Optional[float] = None
    communication_protocol: Optional[str] = None
    data_transmission_interval: Optional[int] = None
    configuration: Optional[Dict[str, Any]] = None


class SensorResponse(SensorBase):
    """Schema for sensor response"""
    id: int
    farm_id: int
    last_reading_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SensorReadingBase(BaseModel):
    """Base sensor reading schema"""
    value: float = Field(..., description="قيمة القراءة")
    unit: Optional[str] = Field(None, description="وحدة القياس")
    quality_score: Optional[float] = Field(None, description="درجة جودة البيانات")
    reading_timestamp: datetime = Field(..., description="وقت القراءة")
    
    # Environmental context
    temperature: Optional[float] = Field(None, description="درجة الحرارة المحيطة")
    humidity: Optional[float] = Field(None, description="الرطوبة المحيطة")
    
    # Additional data
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")


class SensorReadingCreate(SensorReadingBase):
    """Schema for creating a sensor reading"""
    sensor_id: int = Field(..., description="معرف جهاز الاستشعار")


class SensorReadingResponse(SensorReadingBase):
    """Schema for sensor reading response"""
    id: int
    sensor_id: int
    user_id: Optional[int] = None
    received_timestamp: datetime
    
    class Config:
        from_attributes = True


class SensorAlertBase(BaseModel):
    """Base sensor alert schema"""
    alert_type: str = Field(..., description="نوع التنبيه")
    severity: str = Field(..., description="درجة الخطورة")
    message: str = Field(..., description="رسالة التنبيه")
    threshold_value: Optional[float] = Field(None, description="قيمة العتبة")
    actual_value: Optional[float] = Field(None, description="القيمة الفعلية")
    is_resolved: bool = Field(False, description="هل تم حل التنبيه")


class SensorAlertCreate(SensorAlertBase):
    """Schema for creating a sensor alert"""
    sensor_id: int = Field(..., description="معرف جهاز الاستشعار")


class SensorAlertResponse(SensorAlertBase):
    """Schema for sensor alert response"""
    id: int
    sensor_id: int
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True