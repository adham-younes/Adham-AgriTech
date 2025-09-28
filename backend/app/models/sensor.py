"""
Sensor models for IoT devices and data collection
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class SensorType(enum.Enum):
    """Types of IoT sensors"""
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    SOIL_MOISTURE = "soil_moisture"
    SOIL_PH = "soil_ph"
    LIGHT = "light"
    PRESSURE = "pressure"
    WIND_SPEED = "wind_speed"
    WIND_DIRECTION = "wind_direction"
    RAINFALL = "rainfall"
    NUTRIENT_LEVEL = "nutrient_level"
    PEST_DETECTION = "pest_detection"
    CAMERA = "camera"
    OTHER = "other"


class SensorStatus(enum.Enum):
    """Sensor operational status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    OFFLINE = "offline"


class Sensor(Base):
    """IoT sensor device model"""
    
    __tablename__ = "sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Sensor identification
    device_id = Column(String(100), unique=True, nullable=False)  # Unique device identifier
    sensor_type = Column(Enum(SensorType), nullable=False)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    
    # Location and installation
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    altitude = Column(Float, nullable=True)
    installation_date = Column(DateTime(timezone=True), nullable=True)
    
    # Sensor configuration
    measurement_unit = Column(String(50), nullable=True)  # °C, %, mm, etc.
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    calibration_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status and connectivity
    status = Column(Enum(SensorStatus), default=SensorStatus.ACTIVE)
    is_online = Column(Boolean, default=True)
    last_reading_time = Column(DateTime(timezone=True), nullable=True)
    battery_level = Column(Float, nullable=True)  # 0-100%
    signal_strength = Column(Float, nullable=True)  # dBm
    
    # Communication settings
    communication_protocol = Column(String(50), nullable=True)  # WiFi, LoRa, 4G, etc.
    data_transmission_interval = Column(Integer, nullable=True)  # seconds
    
    # Additional configuration
    configuration = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    farm = relationship("Farm", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Sensor(id={self.id}, name='{self.name}', type='{self.sensor_type.value}')>"


class SensorReading(Base):
    """Sensor data readings"""
    
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Reading data
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    quality_score = Column(Float, nullable=True)  # 0-100, data quality indicator
    
    # Metadata
    reading_timestamp = Column(DateTime(timezone=True), nullable=False)
    received_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Environmental context
    temperature = Column(Float, nullable=True)  # Ambient temperature during reading
    humidity = Column(Float, nullable=True)  # Ambient humidity during reading
    
    # Relationships
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who processed/validated
    
    # Additional data
    metadata = Column(JSON, nullable=True)
    
    # Relationships
    sensor = relationship("Sensor", back_populates="readings")
    user = relationship("User", back_populates="sensor_readings")
    
    def __repr__(self):
        return f"<SensorReading(id={self.id}, sensor_id={self.sensor_id}, value={self.value})>"


class SensorAlert(Base):
    """Sensor alerts and notifications"""
    
    __tablename__ = "sensor_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Alert details
    alert_type = Column(String(100), nullable=False)  # threshold_exceeded, device_offline, etc.
    severity = Column(String(50), nullable=False)  # low, medium, high, critical
    message = Column(Text, nullable=False)
    
    # Alert conditions
    threshold_value = Column(Float, nullable=True)
    actual_value = Column(Float, nullable=True)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sensor = relationship("Sensor")
    resolver = relationship("User")
    
    def __repr__(self):
        return f"<SensorAlert(id={self.id}, type='{self.alert_type}', severity='{self.severity}')>"