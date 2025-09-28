"""
Crop management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import structlog

from app.core.database import get_db
from app.models.crop import Crop, CropStatus, CropType
from app.schemas.crop import CropCreate, CropUpdate, CropResponse
from app.services.auth import get_current_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=List[CropResponse])
async def get_crops(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    farm_id: Optional[int] = None,
    status: Optional[CropStatus] = None,
    crop_type: Optional[CropType] = None,
    db: Session = Depends(get_db)
):
    """Get list of crops with optional filtering"""
    try:
        query = db.query(Crop)
        
        if farm_id:
            query = query.filter(Crop.farm_id == farm_id)
        if status:
            query = query.filter(Crop.status == status)
        if crop_type:
            query = query.filter(Crop.crop_type == crop_type)
            
        crops = query.offset(skip).limit(limit).all()
        
        logger.info("Retrieved crops", count=len(crops))
        return crops
        
    except Exception as e:
        logger.error("Failed to retrieve crops", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع المحاصيل")


@router.get("/{crop_id}", response_model=CropResponse)
async def get_crop(crop_id: int, db: Session = Depends(get_db)):
    """Get crop by ID"""
    try:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise HTTPException(status_code=404, detail="المحصول غير موجود")
            
        return crop
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to retrieve crop", crop_id=crop_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع المحصول")


@router.post("/", response_model=CropResponse)
async def create_crop(
    crop_data: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new crop"""
    try:
        crop = Crop(**crop_data.dict())
        db.add(crop)
        db.commit()
        db.refresh(crop)
        
        logger.info("Created crop", crop_id=crop.id, name=crop.name)
        return crop
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to create crop", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في إنشاء المحصول")


@router.put("/{crop_id}", response_model=CropResponse)
async def update_crop(
    crop_id: int,
    crop_data: CropUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update crop information"""
    try:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise HTTPException(status_code=404, detail="المحصول غير موجود")
            
        update_data = crop_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(crop, field, value)
            
        db.commit()
        db.refresh(crop)
        
        logger.info("Updated crop", crop_id=crop_id)
        return crop
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to update crop", crop_id=crop_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في تحديث المحصول")


@router.delete("/{crop_id}")
async def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a crop"""
    try:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise HTTPException(status_code=404, detail="المحصول غير موجود")
            
        db.delete(crop)
        db.commit()
        
        logger.info("Deleted crop", crop_id=crop_id)
        return {"message": "تم حذف المحصول بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to delete crop", crop_id=crop_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في حذف المحصول")