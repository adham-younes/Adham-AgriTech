"""
Analytics schemas
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class FarmAnalyticsResponse(BaseModel):
    """Schema for farm analytics response"""
    farm_id: int
    period_days: int
    total_crops: int
    active_sensors: int
    satellite_images_count: int
    average_ndvi: Optional[float] = None
    soil_health_score: Optional[float] = None
    
    weather_summary: Dict[str, Any] = Field(default_factory=dict)
    crop_health: Dict[str, int] = Field(default_factory=dict)
    alerts_count: int = 0
    generated_at: datetime
    
    class Config:
        from_attributes = True


class CropAnalyticsResponse(BaseModel):
    """Schema for crop analytics response"""
    crop_id: int
    period_days: int
    growth_stage: str
    health_score: float
    expected_yield: float
    actual_yield: float
    growth_rate: float
    
    environmental_conditions: Dict[str, Any] = Field(default_factory=dict)
    satellite_analysis: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime
    
    class Config:
        from_attributes = True


class SensorAnalyticsResponse(BaseModel):
    """Schema for sensor analytics response"""
    farm_id: int
    period_days: int
    total_sensors: int
    active_sensors: int
    offline_sensors: int
    sensor_types: Dict[str, int] = Field(default_factory=dict)
    data_quality_score: float
    
    alerts_summary: Dict[str, int] = Field(default_factory=dict)
    trends: Dict[str, str] = Field(default_factory=dict)
    generated_at: datetime
    
    class Config:
        from_attributes = True


class SatelliteAnalyticsResponse(BaseModel):
    """Schema for satellite analytics response"""
    farm_id: int
    period_days: int
    total_images: int
    cloud_coverage_avg: float
    
    vegetation_indices: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    crop_health_analysis: Dict[str, float] = Field(default_factory=dict)
    change_detection: Dict[str, int] = Field(default_factory=dict)
    generated_at: datetime
    
    class Config:
        from_attributes = True


class DashboardDataResponse(BaseModel):
    """Schema for dashboard data response"""
    user_id: int
    farms_count: int
    total_crops: int
    active_sensors: int
    recent_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    
    weather_summary: Dict[str, Any] = Field(default_factory=dict)
    satellite_summary: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime
    
    class Config:
        from_attributes = True