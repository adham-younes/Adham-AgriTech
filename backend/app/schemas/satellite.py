"""
Satellite data schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.satellite_data import SatelliteType, DataType


class SatelliteDataBase(BaseModel):
    """Base satellite data schema"""
    satellite_type: SatelliteType = Field(..., description="نوع القمر الصناعي")
    data_type: DataType = Field(..., description="نوع البيانات")
    acquisition_date: datetime = Field(..., description="تاريخ الحصول على البيانات")
    cloud_coverage: Optional[float] = Field(None, description="نسبة الغطاء السحابي")
    sun_elevation: Optional[float] = Field(None, description="ارتفاع الشمس")
    sun_azimuth: Optional[float] = Field(None, description="زاوية الشمس")
    
    # Geographic coverage
    center_latitude: Optional[float] = Field(None, description="خط العرض المركزي")
    center_longitude: Optional[float] = Field(None, description="خط الطول المركزي")
    
    # Data files
    image_url: Optional[str] = Field(None, description="رابط الصورة")
    thumbnail_url: Optional[str] = Field(None, description="رابط الصورة المصغرة")
    metadata_url: Optional[str] = Field(None, description="رابط البيانات الوصفية")
    local_file_path: Optional[str] = Field(None, description="مسار الملف المحلي")
    
    # Processing status
    is_processed: bool = Field(False, description="هل تم معالجة البيانات")
    processing_date: Optional[datetime] = Field(None, description="تاريخ المعالجة")
    processing_status: Optional[str] = Field(None, description="حالة المعالجة")
    
    # Data quality
    quality_score: Optional[float] = Field(None, description="درجة جودة البيانات")
    resolution_meters: Optional[float] = Field(None, description="دقة البيانات بالمتر")
    
    # Additional metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")


class SatelliteDataCreate(SatelliteDataBase):
    """Schema for creating satellite data"""
    farm_id: int = Field(..., description="معرف المزرعة")


class SatelliteDataResponse(SatelliteDataBase):
    """Schema for satellite data response"""
    id: int
    farm_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SatelliteAnalysisBase(BaseModel):
    """Base satellite analysis schema"""
    analysis_type: str = Field(..., description="نوع التحليل")
    algorithm_used: Optional[str] = Field(None, description="الخوارزمية المستخدمة")
    version: Optional[str] = Field(None, description="إصدار التحليل")
    
    # Results
    result_data: Optional[Dict[str, Any]] = Field(None, description="نتائج التحليل")
    confidence_score: Optional[float] = Field(None, description="درجة الثقة")
    
    # Visualization
    result_image_url: Optional[str] = Field(None, description="رابط صورة النتائج")
    heatmap_url: Optional[str] = Field(None, description="رابط الخريطة الحرارية")


class SatelliteAnalysisCreate(SatelliteAnalysisBase):
    """Schema for creating satellite analysis"""
    satellite_data_id: int = Field(..., description="معرف بيانات القمر الصناعي")
    crop_id: Optional[int] = Field(None, description="معرف المحصول")


class SatelliteAnalysisResponse(SatelliteAnalysisBase):
    """Schema for satellite analysis response"""
    id: int
    satellite_data_id: int
    crop_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class VegetationIndexBase(BaseModel):
    """Base vegetation index schema"""
    index_name: str = Field(..., description="اسم المؤشر")
    index_value: float = Field(..., description="قيمة المؤشر")
    index_range_min: Optional[float] = Field(None, description="الحد الأدنى للمؤشر")
    index_range_max: Optional[float] = Field(None, description="الحد الأقصى للمؤشر")
    
    # Geographic location
    latitude: float = Field(..., description="خط العرض")
    longitude: float = Field(..., description="خط الطول")


class VegetationIndexCreate(VegetationIndexBase):
    """Schema for creating vegetation index"""
    satellite_data_id: int = Field(..., description="معرف بيانات القمر الصناعي")
    farm_id: int = Field(..., description="معرف المزرعة")


class VegetationIndexResponse(VegetationIndexBase):
    """Schema for vegetation index response"""
    id: int
    satellite_data_id: int
    farm_id: int
    calculated_at: datetime
    
    class Config:
        from_attributes = True