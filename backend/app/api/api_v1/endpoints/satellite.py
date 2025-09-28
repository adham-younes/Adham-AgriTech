"""
Satellite data endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import structlog

from app.core.database import get_db
from app.models.satellite_data import SatelliteData, SatelliteAnalysis, VegetationIndex
from app.schemas.satellite import (
    SatelliteDataResponse, 
    SatelliteAnalysisResponse,
    VegetationIndexResponse
)
from app.services.auth import get_current_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()


@router.get("/data", response_model=List[SatelliteDataResponse])
async def get_satellite_data(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    farm_id: Optional[int] = None,
    satellite_type: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),  # Last 30 days by default
    db: Session = Depends(get_db)
):
    """Get satellite data with optional filtering"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = db.query(SatelliteData).filter(
            SatelliteData.acquisition_date >= start_date,
            SatelliteData.acquisition_date <= end_date
        )
        
        if farm_id:
            query = query.filter(SatelliteData.farm_id == farm_id)
        if satellite_type:
            query = query.filter(SatelliteData.satellite_type == satellite_type)
            
        satellite_data = query.order_by(SatelliteData.acquisition_date.desc()).offset(skip).limit(limit).all()
        
        logger.info("Retrieved satellite data", count=len(satellite_data))
        return satellite_data
        
    except Exception as e:
        logger.error("Failed to retrieve satellite data", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع بيانات الأقمار الصناعية")


@router.get("/data/{data_id}", response_model=SatelliteDataResponse)
async def get_satellite_data_by_id(data_id: int, db: Session = Depends(get_db)):
    """Get specific satellite data by ID"""
    try:
        satellite_data = db.query(SatelliteData).filter(SatelliteData.id == data_id).first()
        if not satellite_data:
            raise HTTPException(status_code=404, detail="بيانات الأقمار الصناعية غير موجودة")
            
        return satellite_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to retrieve satellite data", data_id=data_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع بيانات الأقمار الصناعية")


@router.get("/analyses", response_model=List[SatelliteAnalysisResponse])
async def get_satellite_analyses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    farm_id: Optional[int] = None,
    analysis_type: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get satellite analysis results"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = db.query(SatelliteAnalysis).join(SatelliteData).filter(
            SatelliteAnalysis.created_at >= start_date,
            SatelliteAnalysis.created_at <= end_date
        )
        
        if farm_id:
            query = query.filter(SatelliteData.farm_id == farm_id)
        if analysis_type:
            query = query.filter(SatelliteAnalysis.analysis_type == analysis_type)
            
        analyses = query.order_by(SatelliteAnalysis.created_at.desc()).offset(skip).limit(limit).all()
        
        logger.info("Retrieved satellite analyses", count=len(analyses))
        return analyses
        
    except Exception as e:
        logger.error("Failed to retrieve satellite analyses", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع تحليلات الأقمار الصناعية")


@router.get("/vegetation-indices", response_model=List[VegetationIndexResponse])
async def get_vegetation_indices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    farm_id: Optional[int] = None,
    index_name: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get vegetation indices data"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = db.query(VegetationIndex).filter(
            VegetationIndex.calculated_at >= start_date,
            VegetationIndex.calculated_at <= end_date
        )
        
        if farm_id:
            query = query.filter(VegetationIndex.farm_id == farm_id)
        if index_name:
            query = query.filter(VegetationIndex.index_name == index_name)
            
        indices = query.order_by(VegetationIndex.calculated_at.desc()).offset(skip).limit(limit).all()
        
        logger.info("Retrieved vegetation indices", count=len(indices))
        return indices
        
    except Exception as e:
        logger.error("Failed to retrieve vegetation indices", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع مؤشرات الغطاء النباتي")


@router.post("/request-imagery")
async def request_satellite_imagery(
    farm_id: int,
    satellite_type: str = "sentinel_2",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request new satellite imagery for a farm"""
    try:
        # This would typically trigger a background task to fetch satellite data
        # For now, we'll return a success message
        
        logger.info("Satellite imagery requested", farm_id=farm_id, satellite_type=satellite_type)
        return {
            "message": "تم طلب صور الأقمار الصناعية بنجاح",
            "farm_id": farm_id,
            "satellite_type": satellite_type,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error("Failed to request satellite imagery", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في طلب صور الأقمار الصناعية")