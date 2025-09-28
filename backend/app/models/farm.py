"""
Farm model for managing agricultural farms
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.core.database import Base


class Farm(Base):
    """Farm model for managing agricultural properties"""
    
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Location and geometry
    location = Column(String(255), nullable=True)  # Human readable location
    coordinates = Column(Geometry('POLYGON'), nullable=True)  # GeoJSON polygon
    area_hectares = Column(Float, nullable=True)
    
    # Farm details
    soil_type = Column(String(100), nullable=True)
    climate_zone = Column(String(100), nullable=True)
    irrigation_system = Column(String(100), nullable=True)
    
    # Status and metadata
    status = Column(String(50), default="active")  # active, inactive, maintenance
    metadata = Column(JSON, nullable=True)  # Additional farm-specific data
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")
    sensors = relationship("Sensor", back_populates="farm", cascade="all, delete-orphan")
    satellite_data = relationship("SatelliteData", back_populates="farm", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Farm(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"


class FarmZone(Base):
    """Farm zones for detailed management"""
    
    __tablename__ = "farm_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Zone geometry
    coordinates = Column(Geometry('POLYGON'), nullable=True)
    area_hectares = Column(Float, nullable=True)
    
    # Zone properties
    soil_ph = Column(Float, nullable=True)
    soil_moisture = Column(Float, nullable=True)
    fertility_level = Column(String(50), nullable=True)  # low, medium, high
    
    # Farm relationship
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    farm = relationship("Farm")
    crops = relationship("Crop", back_populates="zone")
    
    def __repr__(self):
        return f"<FarmZone(id={self.id}, name='{self.name}', farm_id={self.farm_id})>"