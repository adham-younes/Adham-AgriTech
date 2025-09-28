"""
Pydantic schemas for Farm models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from geoalchemy2.shape import to_shape


class FarmBase(BaseModel):
    """Base farm schema"""
    name: str = Field(..., description="اسم المزرعة")
    description: Optional[str] = Field(None, description="وصف المزرعة")
    location: Optional[str] = Field(None, description="موقع المزرعة")
    area_hectares: Optional[float] = Field(None, description="مساحة المزرعة بالهكتار")
    soil_type: Optional[str] = Field(None, description="نوع التربة")
    climate_zone: Optional[str] = Field(None, description="المنطقة المناخية")
    irrigation_system: Optional[str] = Field(None, description="نظام الري")
    status: str = Field("active", description="حالة المزرعة")
    metadata: Optional[Dict[str, Any]] = Field(None, description="بيانات إضافية")


class FarmCreate(FarmBase):
    """Schema for creating a farm"""
    owner_id: int = Field(..., description="معرف المالك")


class FarmUpdate(BaseModel):
    """Schema for updating a farm"""
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    area_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    climate_zone: Optional[str] = None
    irrigation_system: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class FarmResponse(FarmBase):
    """Schema for farm response"""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class FarmZoneBase(BaseModel):
    """Base farm zone schema"""
    name: str = Field(..., description="اسم المنطقة")
    description: Optional[str] = Field(None, description="وصف المنطقة")
    area_hectares: Optional[float] = Field(None, description="مساحة المنطقة بالهكتار")
    soil_ph: Optional[float] = Field(None, description="درجة حموضة التربة")
    soil_moisture: Optional[float] = Field(None, description="رطوبة التربة")
    fertility_level: Optional[str] = Field(None, description="مستوى خصوبة التربة")


class FarmZoneCreate(FarmZoneBase):
    """Schema for creating a farm zone"""
    pass


class FarmZoneResponse(FarmZoneBase):
    """Schema for farm zone response"""
    id: int
    farm_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class FarmWithZones(FarmResponse):
    """Farm response with zones included"""
    zones: List[FarmZoneResponse] = []


class FarmStatistics(BaseModel):
    """Farm statistics schema"""
    total_area_hectares: float
    total_zones: int
    active_crops: int
    total_sensors: int
    last_satellite_image: Optional[datetime] = None
    average_ndvi: Optional[float] = None
    soil_health_score: Optional[float] = None