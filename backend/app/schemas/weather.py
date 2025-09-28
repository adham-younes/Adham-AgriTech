"""
Weather data schemas
"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class WeatherDataBase(BaseModel):
    """Base weather data schema"""
    latitude: float = Field(..., description="خط العرض")
    longitude: float = Field(..., description="خط الطول")
    
    # Weather measurements
    temperature_celsius: Optional[float] = Field(None, description="درجة الحرارة بالسيليزيوس")
    humidity_percent: Optional[float] = Field(None, description="الرطوبة بالنسبة المئوية")
    pressure_hpa: Optional[float] = Field(None, description="الضغط الجوي بالهيكتوباسكال")
    wind_speed_kmh: Optional[float] = Field(None, description="سرعة الرياح بالكيلومتر/ساعة")
    wind_direction_degrees: Optional[float] = Field(None, description="اتجاه الرياح بالدرجات")
    rainfall_mm: Optional[float] = Field(None, description="كمية الأمطار بالمليمتر")
    solar_radiation_wm2: Optional[float] = Field(None, description="الإشعاع الشمسي بالواط/متر مربع")
    
    # Data source
    data_source: Optional[str] = Field(None, description="مصدر البيانات")
    forecast_hours: Optional[int] = Field(None, description="ساعات التوقع (0 للوقت الحالي)")
    
    # Timestamps
    measurement_time: datetime = Field(..., description="وقت القياس")


class WeatherDataCreate(WeatherDataBase):
    """Schema for creating weather data"""
    farm_id: int = Field(..., description="معرف المزرعة")


class WeatherDataResponse(WeatherDataBase):
    """Schema for weather data response"""
    id: int
    farm_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class WeatherForecastResponse(BaseModel):
    """Schema for weather forecast response"""
    farm_id: int
    forecast_data: list[WeatherDataResponse]
    generated_at: datetime
    forecast_period_hours: int
    
    class Config:
        from_attributes = True


class WeatherSummaryResponse(BaseModel):
    """Schema for weather summary response"""
    farm_id: int
    current_temperature: Optional[float] = None
    current_humidity: Optional[float] = None
    current_pressure: Optional[float] = None
    current_wind_speed: Optional[float] = None
    current_wind_direction: Optional[float] = None
    last_24h_rainfall: Optional[float] = None
    forecast_summary: Optional[str] = None
    last_updated: datetime
    
    class Config:
        from_attributes = True