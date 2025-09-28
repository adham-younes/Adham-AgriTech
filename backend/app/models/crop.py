"""
Crop model for managing agricultural crops
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class CropStatus(enum.Enum):
    """Crop growth status"""
    PLANNED = "planned"
    PLANTED = "planted"
    GERMINATED = "germinated"
    VEGETATIVE = "vegetative"
    FLOWERING = "flowering"
    FRUITING = "fruiting"
    MATURE = "mature"
    HARVESTED = "harvested"
    FAILED = "failed"


class CropType(enum.Enum):
    """Crop type categories"""
    CEREALS = "cereals"  # قمح، شعير، ذرة
    VEGETABLES = "vegetables"  # خضروات
    FRUITS = "fruits"  # فواكه
    LEGUMES = "legumes"  # بقوليات
    HERBS = "herbs"  # أعشاب
    SPICES = "spices"  # توابل
    OTHER = "other"


class Crop(Base):
    """Crop model for managing agricultural crops"""
    
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    variety = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Crop classification
    crop_type = Column(Enum(CropType), nullable=False)
    scientific_name = Column(String(255), nullable=True)
    
    # Growth information
    planting_date = Column(DateTime(timezone=True), nullable=True)
    expected_harvest_date = Column(DateTime(timezone=True), nullable=True)
    actual_harvest_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(CropStatus), default=CropStatus.PLANNED)
    
    # Area and yield
    planted_area_hectares = Column(Float, nullable=True)
    expected_yield_kg = Column(Float, nullable=True)
    actual_yield_kg = Column(Float, nullable=True)
    
    # Growth parameters
    growth_stage_days = Column(Integer, nullable=True)
    maturity_days = Column(Integer, nullable=True)
    
    # Environmental requirements
    optimal_temperature_min = Column(Float, nullable=True)
    optimal_temperature_max = Column(Float, nullable=True)
    optimal_humidity_min = Column(Float, nullable=True)
    optimal_humidity_max = Column(Float, nullable=True)
    water_requirements_mm = Column(Float, nullable=True)
    
    # Farm and zone relationships
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("farm_zones.id"), nullable=True)
    
    # Additional data
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    farm = relationship("Farm", back_populates="crops")
    zone = relationship("FarmZone", back_populates="crops")
    satellite_analysis = relationship("SatelliteAnalysis", back_populates="crop")
    
    def __repr__(self):
        return f"<Crop(id={self.id}, name='{self.name}', status='{self.status.value}')>"


class CropGrowthStage(Base):
    """Crop growth stages tracking"""
    
    __tablename__ = "crop_growth_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_name = Column(String(100), nullable=False)
    stage_description = Column(Text, nullable=True)
    
    # Stage timing
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    duration_days = Column(Integer, nullable=True)
    
    # Stage metrics
    height_cm = Column(Float, nullable=True)
    leaf_count = Column(Integer, nullable=True)
    health_score = Column(Float, nullable=True)  # 0-100
    
    # Environmental conditions during stage
    avg_temperature = Column(Float, nullable=True)
    avg_humidity = Column(Float, nullable=True)
    total_rainfall_mm = Column(Float, nullable=True)
    
    # Crop relationship
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    crop = relationship("Crop")
    
    def __repr__(self):
        return f"<CropGrowthStage(id={self.id}, stage='{self.stage_name}', crop_id={self.crop_id})>"