"""
Weather data endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import structlog

from app.core.database import get_db
from app.models.satellite_data import WeatherData
from app.schemas.weather import WeatherDataResponse, WeatherForecastResponse
from app.services.auth import get_current_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()


@router.get("/current", response_model=List[WeatherDataResponse])
async def get_current_weather(
    farm_id: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get current weather data"""
    try:
        query = db.query(WeatherData).filter(
            WeatherData.forecast_hours == 0,  # Current weather
            WeatherData.measurement_time >= datetime.utcnow() - timedelta(hours=1)
        )
        
        if farm_id:
            query = query.filter(WeatherData.farm_id == farm_id)
        if latitude and longitude:
            # Simple proximity search (in production, use proper spatial queries)
            query = query.filter(
                WeatherData.latitude.between(latitude - 0.1, latitude + 0.1),
                WeatherData.longitude.between(longitude - 0.1, longitude + 0.1)
            )
            
        weather_data = query.order_by(WeatherData.measurement_time.desc()).limit(10).all()
        
        logger.info("Retrieved current weather data", count=len(weather_data))
        return weather_data
        
    except Exception as e:
        logger.error("Failed to retrieve current weather", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع بيانات الطقس الحالية")


@router.get("/forecast", response_model=List[WeatherDataResponse])
async def get_weather_forecast(
    farm_id: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    hours: int = Query(24, ge=1, le=168),  # 24 hours to 1 week
    db: Session = Depends(get_db)
):
    """Get weather forecast data"""
    try:
        query = db.query(WeatherData).filter(
            WeatherData.forecast_hours > 0,
            WeatherData.forecast_hours <= hours,
            WeatherData.measurement_time >= datetime.utcnow()
        )
        
        if farm_id:
            query = query.filter(WeatherData.farm_id == farm_id)
        if latitude and longitude:
            query = query.filter(
                WeatherData.latitude.between(latitude - 0.1, latitude + 0.1),
                WeatherData.longitude.between(longitude - 0.1, longitude + 0.1)
            )
            
        forecast_data = query.order_by(WeatherData.measurement_time.asc()).all()
        
        logger.info("Retrieved weather forecast", count=len(forecast_data))
        return forecast_data
        
    except Exception as e:
        logger.error("Failed to retrieve weather forecast", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع توقعات الطقس")


@router.get("/history", response_model=List[WeatherDataResponse])
async def get_weather_history(
    farm_id: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    days: int = Query(7, ge=1, le=30),  # 1 week to 1 month
    db: Session = Depends(get_db)
):
    """Get historical weather data"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = db.query(WeatherData).filter(
            WeatherData.forecast_hours == 0,  # Historical data
            WeatherData.measurement_time >= start_date,
            WeatherData.measurement_time <= end_date
        )
        
        if farm_id:
            query = query.filter(WeatherData.farm_id == farm_id)
        if latitude and longitude:
            query = query.filter(
                WeatherData.latitude.between(latitude - 0.1, latitude + 0.1),
                WeatherData.longitude.between(longitude - 0.1, longitude + 0.1)
            )
            
        history_data = query.order_by(WeatherData.measurement_time.desc()).all()
        
        logger.info("Retrieved weather history", count=len(history_data))
        return history_data
        
    except Exception as e:
        logger.error("Failed to retrieve weather history", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع تاريخ الطقس")


@router.post("/update")
async def update_weather_data(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger weather data update for a farm"""
    try:
        # This would typically trigger a background task to fetch latest weather data
        # For now, we'll return a success message
        
        logger.info("Weather data update requested", farm_id=farm_id)
        return {
            "message": "تم طلب تحديث بيانات الطقس بنجاح",
            "farm_id": farm_id,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error("Failed to update weather data", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في تحديث بيانات الطقس")