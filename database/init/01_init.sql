-- Adham AgriTech Database Initialization
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create database if not exists (this will be handled by Docker)
-- CREATE DATABASE adham_agritech;

-- Set timezone
SET timezone = 'Asia/Riyadh';

-- Create custom types
DO $$ BEGIN
    CREATE TYPE crop_status AS ENUM (
        'planned', 'planted', 'germinated', 'vegetative', 
        'flowering', 'fruiting', 'mature', 'harvested', 'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crop_type AS ENUM (
        'cereals', 'vegetables', 'fruits', 'legumes', 
        'herbs', 'spices', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sensor_type AS ENUM (
        'temperature', 'humidity', 'soil_moisture', 'soil_ph',
        'light', 'pressure', 'wind_speed', 'wind_direction',
        'rainfall', 'nutrient_level', 'pest_detection', 'camera', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sensor_status AS ENUM (
        'active', 'inactive', 'maintenance', 'error', 'offline'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE satellite_type AS ENUM (
        'sentinel_2', 'sentinel_1', 'landsat_8', 'landsat_9',
        'modis', 'spot', 'pleiades', 'worldview', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE data_type AS ENUM (
        'optical', 'radar', 'thermal', 'multispectral', 'hyperspectral'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;