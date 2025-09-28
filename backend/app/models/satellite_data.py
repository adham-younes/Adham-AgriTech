"""
Satellite data models for remote sensing and monitoring
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import enum

from app.core.database import Base


class SatelliteType(enum.Enum):
    """Types of satellites"""
    SENTINEL_2 = "sentinel_2"
    SENTINEL_1 = "sentinel_1"
    LANDSAT_8 = "landsat_8"
    LANDSAT_9 = "landsat_9"
    MODIS = "modis"
    SPOT = "spot"
    PLEIADES = "pleiades"
    WORLDVIEW = "worldview"
    OTHER = "other"


class DataType(enum.Enum):
    """Types of satellite data"""
    OPTICAL = "optical"
    RADAR = "radar"
    THERMAL = "thermal"
    MULTISPECTRAL = "multispectral"
    HYPERSPECTRAL = "hyperspectral"


class SatelliteData(Base):
    """Satellite imagery and data"""
    
    __tablename__ = "satellite_data"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Satellite information
    satellite_type = Column(Enum(SatelliteType), nullable=False)
    data_type = Column(Enum(DataType), nullable=False)
    
    # Acquisition details
    acquisition_date = Column(DateTime(timezone=True), nullable=False)
    cloud_coverage = Column(Float, nullable=True)  # 0-100%
    sun_elevation = Column(Float, nullable=True)
    sun_azimuth = Column(Float, nullable=True)
    
    # Geographic coverage
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    geometry = Column(Geometry('POLYGON'), nullable=True)  # Coverage area
    center_latitude = Column(Float, nullable=True)
    center_longitude = Column(Float, nullable=True)
    
    # Data files and URLs
    image_url = Column(String(1000), nullable=True)
    thumbnail_url = Column(String(1000), nullable=True)
    metadata_url = Column(String(1000), nullable=True)
    local_file_path = Column(String(500), nullable=True)
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    processing_date = Column(DateTime(timezone=True), nullable=True)
    processing_status = Column(String(50), nullable=True)  # pending, processing, completed, failed
    
    # Data quality
    quality_score = Column(Float, nullable=True)  # 0-100
    resolution_meters = Column(Float, nullable=True)
    
    # Additional metadata
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    farm = relationship("Farm", back_populates="satellite_data")
    analyses = relationship("SatelliteAnalysis", back_populates="satellite_data", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SatelliteData(id={self.id}, satellite='{self.satellite_type.value}', date='{self.acquisition_date}')>"


class SatelliteAnalysis(Base):
    """Analysis results from satellite data"""
    
    __tablename__ = "satellite_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Analysis details
    analysis_type = Column(String(100), nullable=False)  # ndvi, ndwi, crop_health, etc.
    algorithm_used = Column(String(100), nullable=True)
    version = Column(String(50), nullable=True)
    
    # Results
    result_data = Column(JSON, nullable=True)  # Analysis results and metrics
    confidence_score = Column(Float, nullable=True)  # 0-100
    
    # Visualization
    result_image_url = Column(String(1000), nullable=True)
    heatmap_url = Column(String(1000), nullable=True)
    
    # Crop-specific analysis
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    
    # Relationships
    satellite_data_id = Column(Integer, ForeignKey("satellite_data.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    satellite_data = relationship("SatelliteData", back_populates="analyses")
    crop = relationship("Crop", back_populates="satellite_analysis")
    
    def __repr__(self):
        return f"<SatelliteAnalysis(id={self.id}, type='{self.analysis_type}', confidence={self.confidence_score})>"


class VegetationIndex(Base):
    """Vegetation indices calculated from satellite data"""
    
    __tablename__ = "vegetation_indices"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Index information
    index_name = Column(String(50), nullable=False)  # NDVI, NDWI, EVI, etc.
    index_value = Column(Float, nullable=False)
    index_range_min = Column(Float, nullable=True)
    index_range_max = Column(Float, nullable=True)
    
    # Geographic location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Relationships
    satellite_data_id = Column(Integer, ForeignKey("satellite_data.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    
    # Timestamps
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    satellite_data = relationship("SatelliteData")
    farm = relationship("Farm")
    
    def __repr__(self):
        return f"<VegetationIndex(id={self.id}, index='{self.index_name}', value={self.index_value})>"


class WeatherData(Base):
    """Weather data from satellite and ground sources"""
    
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Location
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Weather measurements
    temperature_celsius = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    pressure_hpa = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    wind_direction_degrees = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    solar_radiation_wm2 = Column(Float, nullable=True)
    
    # Data source
    data_source = Column(String(100), nullable=True)  # satellite, ground_station, api
    forecast_hours = Column(Integer, nullable=True)  # 0 for current, >0 for forecast
    
    # Timestamps
    measurement_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    farm = relationship("Farm")
    
    def __repr__(self):
        return f"<WeatherData(id={self.id}, farm_id={self.farm_id}, temp={self.temperature_celsius}°C)>"