"""
Sensor management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import structlog

from app.core.database import get_db
from app.models.sensor import Sensor, SensorReading, SensorType, SensorStatus
from app.schemas.sensor import SensorCreate, SensorUpdate, SensorResponse, SensorReadingResponse
from app.services.auth import get_current_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=List[SensorResponse])
async def get_sensors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    farm_id: Optional[int] = None,
    sensor_type: Optional[SensorType] = None,
    status: Optional[SensorStatus] = None,
    db: Session = Depends(get_db)
):
    """Get list of sensors with optional filtering"""
    try:
        query = db.query(Sensor)
        
        if farm_id:
            query = query.filter(Sensor.farm_id == farm_id)
        if sensor_type:
            query = query.filter(Sensor.sensor_type == sensor_type)
        if status:
            query = query.filter(Sensor.status == status)
            
        sensors = query.offset(skip).limit(limit).all()
        
        logger.info("Retrieved sensors", count=len(sensors))
        return sensors
        
    except Exception as e:
        logger.error("Failed to retrieve sensors", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع أجهزة الاستشعار")


@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """Get sensor by ID"""
    try:
        sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
        if not sensor:
            raise HTTPException(status_code=404, detail="جهاز الاستشعار غير موجود")
            
        return sensor
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to retrieve sensor", sensor_id=sensor_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع جهاز الاستشعار")


@router.post("/", response_model=SensorResponse)
async def create_sensor(
    sensor_data: SensorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sensor"""
    try:
        sensor = Sensor(**sensor_data.dict())
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        
        logger.info("Created sensor", sensor_id=sensor.id, name=sensor.name)
        return sensor
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to create sensor", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في إنشاء جهاز الاستشعار")


@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(
    sensor_id: int,
    sensor_data: SensorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update sensor information"""
    try:
        sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
        if not sensor:
            raise HTTPException(status_code=404, detail="جهاز الاستشعار غير موجود")
            
        update_data = sensor_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(sensor, field, value)
            
        db.commit()
        db.refresh(sensor)
        
        logger.info("Updated sensor", sensor_id=sensor_id)
        return sensor
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to update sensor", sensor_id=sensor_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في تحديث جهاز الاستشعار")


@router.delete("/{sensor_id}")
async def delete_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sensor"""
    try:
        sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
        if not sensor:
            raise HTTPException(status_code=404, detail="جهاز الاستشعار غير موجود")
            
        db.delete(sensor)
        db.commit()
        
        logger.info("Deleted sensor", sensor_id=sensor_id)
        return {"message": "تم حذف جهاز الاستشعار بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to delete sensor", sensor_id=sensor_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في حذف جهاز الاستشعار")


@router.get("/{sensor_id}/readings", response_model=List[SensorReadingResponse])
async def get_sensor_readings(
    sensor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    hours: int = Query(24, ge=1, le=168),  # Last 24 hours by default, max 1 week
    db: Session = Depends(get_db)
):
    """Get sensor readings for a specific sensor"""
    try:
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        readings = db.query(SensorReading).filter(
            SensorReading.sensor_id == sensor_id,
            SensorReading.reading_timestamp >= start_time,
            SensorReading.reading_timestamp <= end_time
        ).order_by(SensorReading.reading_timestamp.desc()).offset(skip).limit(limit).all()
        
        logger.info("Retrieved sensor readings", sensor_id=sensor_id, count=len(readings))
        return readings
        
    except Exception as e:
        logger.error("Failed to retrieve sensor readings", sensor_id=sensor_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع قراءات جهاز الاستشعار")