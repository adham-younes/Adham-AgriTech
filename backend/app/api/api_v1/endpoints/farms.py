"""
Farm management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import structlog

from app.core.database import get_db
from app.models.farm import Farm, FarmZone
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, FarmZoneCreate, FarmZoneResponse

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=List[FarmResponse])
async def get_farms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    owner_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of farms with optional filtering"""
    try:
        query = db.query(Farm)
        
        if owner_id:
            query = query.filter(Farm.owner_id == owner_id)
        if status:
            query = query.filter(Farm.status == status)
            
        farms = query.offset(skip).limit(limit).all()
        
        logger.info("Retrieved farms", count=len(farms), owner_id=owner_id, status=status)
        return farms
        
    except Exception as e:
        logger.error("Failed to retrieve farms", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع المزارع")


@router.get("/{farm_id}", response_model=FarmResponse)
async def get_farm(farm_id: int, db: Session = Depends(get_db)):
    """Get farm by ID"""
    try:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="المزرعة غير موجودة")
            
        logger.info("Retrieved farm", farm_id=farm_id)
        return farm
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to retrieve farm", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع المزرعة")


@router.post("/", response_model=FarmResponse)
async def create_farm(farm_data: FarmCreate, db: Session = Depends(get_db)):
    """Create a new farm"""
    try:
        # Create farm
        farm = Farm(**farm_data.dict())
        db.add(farm)
        db.commit()
        db.refresh(farm)
        
        logger.info("Created farm", farm_id=farm.id, name=farm.name)
        return farm
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to create farm", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في إنشاء المزرعة")


@router.put("/{farm_id}", response_model=FarmResponse)
async def update_farm(
    farm_id: int,
    farm_data: FarmUpdate,
    db: Session = Depends(get_db)
):
    """Update farm information"""
    try:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="المزرعة غير موجودة")
            
        # Update farm fields
        update_data = farm_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(farm, field, value)
            
        db.commit()
        db.refresh(farm)
        
        logger.info("Updated farm", farm_id=farm_id)
        return farm
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to update farm", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في تحديث المزرعة")


@router.delete("/{farm_id}")
async def delete_farm(farm_id: int, db: Session = Depends(get_db)):
    """Delete a farm"""
    try:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="المزرعة غير موجودة")
            
        db.delete(farm)
        db.commit()
        
        logger.info("Deleted farm", farm_id=farm_id)
        return {"message": "تم حذف المزرعة بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to delete farm", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في حذف المزرعة")


# Farm Zones endpoints
@router.get("/{farm_id}/zones", response_model=List[FarmZoneResponse])
async def get_farm_zones(farm_id: int, db: Session = Depends(get_db)):
    """Get zones for a specific farm"""
    try:
        zones = db.query(FarmZone).filter(FarmZone.farm_id == farm_id).all()
        
        logger.info("Retrieved farm zones", farm_id=farm_id, count=len(zones))
        return zones
        
    except Exception as e:
        logger.error("Failed to retrieve farm zones", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع مناطق المزرعة")


@router.post("/{farm_id}/zones", response_model=FarmZoneResponse)
async def create_farm_zone(
    farm_id: int,
    zone_data: FarmZoneCreate,
    db: Session = Depends(get_db)
):
    """Create a new zone for a farm"""
    try:
        # Verify farm exists
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="المزرعة غير موجودة")
            
        # Create zone
        zone_data_dict = zone_data.dict()
        zone_data_dict["farm_id"] = farm_id
        zone = FarmZone(**zone_data_dict)
        
        db.add(zone)
        db.commit()
        db.refresh(zone)
        
        logger.info("Created farm zone", farm_id=farm_id, zone_id=zone.id)
        return zone
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to create farm zone", farm_id=farm_id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في إنشاء منطقة المزرعة")