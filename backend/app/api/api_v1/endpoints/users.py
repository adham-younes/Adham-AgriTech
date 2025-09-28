"""
User management endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import structlog

from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import get_current_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of users (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="غير مصرح بالوصول")
    
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        return users
    except Exception as e:
        logger.error("Failed to retrieve users", error=str(e))
        raise HTTPException(status_code=500, detail="فشل في استرجاع المستخدمين")


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    try:
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_user, field, value)
            
        db.commit()
        db.refresh(current_user)
        
        logger.info("User updated", user_id=current_user.id)
        return current_user
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to update user", user_id=current_user.id, error=str(e))
        raise HTTPException(status_code=500, detail="فشل في تحديث البيانات")