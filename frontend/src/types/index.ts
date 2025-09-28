// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  bio?: string;
  location?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  phone?: string;
}

// Farm types
export interface Farm {
  id: number;
  name: string;
  description?: string;
  location?: string;
  area_hectares?: number;
  soil_type?: string;
  climate_zone?: string;
  irrigation_system?: string;
  status: string;
  metadata?: Record<string, any>;
  owner_id: number;
  created_at: string;
  updated_at?: string;
}

export interface FarmZone {
  id: number;
  name: string;
  description?: string;
  area_hectares?: number;
  soil_ph?: number;
  soil_moisture?: number;
  fertility_level?: string;
  farm_id: number;
  created_at: string;
  updated_at?: string;
}

// Crop types
export enum CropStatus {
  PLANNED = 'planned',
  PLANTED = 'planted',
  GERMINATED = 'germinated',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  MATURE = 'mature',
  HARVESTED = 'harvested',
  FAILED = 'failed'
}

export enum CropType {
  CEREALS = 'cereals',
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  LEGUMES = 'legumes',
  HERBS = 'herbs',
  SPICES = 'spices',
  OTHER = 'other'
}

export interface Crop {
  id: number;
  name: string;
  variety?: string;
  description?: string;
  crop_type: CropType;
  scientific_name?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  status: CropStatus;
  planted_area_hectares?: number;
  expected_yield_kg?: number;
  actual_yield_kg?: number;
  growth_stage_days?: number;
  maturity_days?: number;
  optimal_temperature_min?: number;
  optimal_temperature_max?: number;
  optimal_humidity_min?: number;
  optimal_humidity_max?: number;
  water_requirements_mm?: number;
  farm_id: number;
  zone_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

// Sensor types
export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  SOIL_MOISTURE = 'soil_moisture',
  SOIL_PH = 'soil_ph',
  LIGHT = 'light',
  PRESSURE = 'pressure',
  WIND_SPEED = 'wind_speed',
  WIND_DIRECTION = 'wind_direction',
  RAINFALL = 'rainfall',
  NUTRIENT_LEVEL = 'nutrient_level',
  PEST_DETECTION = 'pest_detection',
  CAMERA = 'camera',
  OTHER = 'other'
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export interface Sensor {
  id: number;
  name: string;
  description?: string;
  device_id: string;
  sensor_type: SensorType;
  manufacturer?: string;
  model?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  installation_date?: string;
  measurement_unit?: string;
  min_value?: number;
  max_value?: number;
  accuracy?: number;
  calibration_date?: string;
  status: SensorStatus;
  is_online: boolean;
  battery_level?: number;
  signal_strength?: number;
  communication_protocol?: string;
  data_transmission_interval?: number;
  configuration?: Record<string, any>;
  farm_id: number;
  last_reading_time?: string;
  created_at: string;
  updated_at?: string;
}

export interface SensorReading {
  id: number;
  sensor_id: number;
  value: number;
  unit?: string;
  quality_score?: number;
  reading_timestamp: string;
  received_timestamp: string;
  temperature?: number;
  humidity?: number;
  metadata?: Record<string, any>;
  user_id?: number;
}

// Satellite types
export enum SatelliteType {
  SENTINEL_2 = 'sentinel_2',
  SENTINEL_1 = 'sentinel_1',
  LANDSAT_8 = 'landsat_8',
  LANDSAT_9 = 'landsat_9',
  MODIS = 'modis',
  SPOT = 'spot',
  PLEIADES = 'pleiades',
  WORLDVIEW = 'worldview',
  OTHER = 'other'
}

export enum DataType {
  OPTICAL = 'optical',
  RADAR = 'radar',
  THERMAL = 'thermal',
  MULTISPECTRAL = 'multispectral',
  HYPERSPECTRAL = 'hyperspectral'
}

export interface SatelliteData {
  id: number;
  satellite_type: SatelliteType;
  data_type: DataType;
  acquisition_date: string;
  cloud_coverage?: number;
  sun_elevation?: number;
  sun_azimuth?: number;
  center_latitude?: number;
  center_longitude?: number;
  image_url?: string;
  thumbnail_url?: string;
  metadata_url?: string;
  local_file_path?: string;
  is_processed: boolean;
  processing_date?: string;
  processing_status?: string;
  quality_score?: number;
  resolution_meters?: number;
  metadata?: Record<string, any>;
  farm_id: number;
  created_at: string;
  updated_at?: string;
}

// Weather types
export interface WeatherData {
  id: number;
  farm_id: number;
  latitude: number;
  longitude: number;
  temperature_celsius?: number;
  humidity_percent?: number;
  pressure_hpa?: number;
  wind_speed_kmh?: number;
  wind_direction_degrees?: number;
  rainfall_mm?: number;
  solar_radiation_wm2?: number;
  data_source?: string;
  forecast_hours?: number;
  measurement_time: string;
  created_at: string;
}

// Analytics types
export interface FarmAnalytics {
  farm_id: number;
  period_days: number;
  total_crops: number;
  active_sensors: number;
  satellite_images_count: number;
  average_ndvi?: number;
  soil_health_score?: number;
  weather_summary: Record<string, any>;
  crop_health: Record<string, number>;
  alerts_count: number;
  generated_at: string;
}

export interface DashboardData {
  user_id: number;
  farms_count: number;
  total_crops: number;
  active_sensors: number;
  recent_alerts: Array<Record<string, any>>;
  weather_summary: Record<string, any>;
  satellite_summary: Record<string, any>;
  generated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Map types
export interface MapLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface MapMarker {
  id: string | number;
  position: [number, number];
  title: string;
  description?: string;
  type?: 'farm' | 'sensor' | 'crop';
  status?: string;
}