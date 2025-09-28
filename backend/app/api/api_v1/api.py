"""
API v1 router configuration
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    auth,
    users,
    farms,
    crops,
    sensors,
    satellite,
    weather,
    analytics
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(sensors.router, prefix="/sensors", tags=["sensors"])
api_router.include_router(satellite.router, prefix="/satellite", tags=["satellite"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])