"""
Crop schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.crop import CropStatus, CropType


class CropBase(BaseModel):
    """Base crop schema"""
    name: str = Field(..., description="اسم المحصول")
    variety: Optional[str] = Field(None, description="صنف المحصول")
    description: Optional[str] = Field(None, description="وصف المحصول")
    crop_type: CropType = Field(..., description="نوع المحصول")
    scientific_name: Optional[str] = Field(None, description="الاسم العلمي")
    
    # Growth information
    planting_date: Optional[datetime] = Field(None, description="تاريخ الزراعة")
    expected_harvest_date: Optional[datetime] = Field(None, description="تاريخ الحصاد المتوقع")
    actual_harvest_date: Optional[datetime] = Field(None, description="تاريخ الحصاد الفعلي")
    status: CropStatus = Field(CropStatus.PLANNED, description="حالة المحصول")
    
    # Area and yield
    planted_area_hectares: Optional[float] = Field(None, description="المساحة المزروعة بالهكتار")
    expected_yield_kg: Optional[float] = Field(None, description="الإنتاج المتوقع بالكيلوغرام")
    actual_yield_kg: Optional[float] = Field(None, description="الإنتاج الفعلي بالكيلوغرام")
    
    # Growth parameters
    growth_stage_days: Optional[int] = Field(None, description="أيام مرحلة النمو")
    maturity_days: Optional[int] = Field(None, description="أيام النضج")
    
    # Environmental requirements
    optimal_temperature_min: Optional[float] = Field(None, description="الحد الأدنى لدرجة الحرارة المثلى")
    optimal_temperature_max: Optional[float] = Field(None, description="الحد الأقصى لدرجة الحرارة المثلى")
    optimal_humidity_min: Optional[float] = Field(None, description="الحد الأدنى للرطوبة المثلى")
    optimal_humidity_max: Optional[float] = Field(None, description="الحد الأقصى للرطوبة المثلى")
    water_requirements_mm: Optional[float] = Field(None, description="متطلبات المياه بالمليمتر")
    
    # Additional data
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")


class CropCreate(CropBase):
    """Schema for creating a crop"""
    farm_id: int = Field(..., description="معرف المزرعة")
    zone_id: Optional[int] = Field(None, description="معرف المنطقة")


class CropUpdate(BaseModel):
    """Schema for updating a crop"""
    name: Optional[str] = None
    variety: Optional[str] = None
    description: Optional[str] = None
    scientific_name: Optional[str] = None
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    actual_harvest_date: Optional[datetime] = None
    status: Optional[CropStatus] = None
    planted_area_hectares: Optional[float] = None
    expected_yield_kg: Optional[float] = None
    actual_yield_kg: Optional[float] = None
    growth_stage_days: Optional[int] = None
    maturity_days: Optional[int] = None
    optimal_temperature_min: Optional[float] = None
    optimal_temperature_max: Optional[float] = None
    optimal_humidity_min: Optional[float] = None
    optimal_humidity_max: Optional[float] = None
    water_requirements_mm: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class CropResponse(CropBase):
    """Schema for crop response"""
    id: int
    farm_id: int
    zone_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CropGrowthStageBase(BaseModel):
    """Base crop growth stage schema"""
    stage_name: str = Field(..., description="اسم المرحلة")
    stage_description: Optional[str] = Field(None, description="وصف المرحلة")
    start_date: Optional[datetime] = Field(None, description="تاريخ البداية")
    end_date: Optional[datetime] = Field(None, description="تاريخ النهاية")
    duration_days: Optional[int] = Field(None, description="مدة المرحلة بالأيام")
    
    # Stage metrics
    height_cm: Optional[float] = Field(None, description="الارتفاع بالسنتيمتر")
    leaf_count: Optional[int] = Field(None, description="عدد الأوراق")
    health_score: Optional[float] = Field(None, description="درجة الصحة")
    
    # Environmental conditions
    avg_temperature: Optional[float] = Field(None, description="متوسط درجة الحرارة")
    avg_humidity: Optional[float] = Field(None, description="متوسط الرطوبة")
    total_rainfall_mm: Optional[float] = Field(None, description="إجمالي الأمطار بالمليمتر")


class CropGrowthStageCreate(CropGrowthStageBase):
    """Schema for creating a crop growth stage"""
    crop_id: int = Field(..., description="معرف المحصول")


class CropGrowthStageResponse(CropGrowthStageBase):
    """Schema for crop growth stage response"""
    id: int
    crop_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True