-- Sample data for Adham AgriTech
-- Insert sample users
INSERT INTO users (email, username, full_name, hashed_password, phone, bio, location, is_active, is_verified, is_superuser, created_at) VALUES
('admin@adham-agritech.com', 'admin', 'مدير النظام', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', '+966501234567', 'مدير نظام الزراعة الذكية', 'الرياض، المملكة العربية السعودية', true, true, true, NOW()),
('farmer1@example.com', 'farmer1', 'أحمد محمد', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', '+966501234568', 'مزارع متخصص في الخضروات', 'الدمام، المملكة العربية السعودية', true, true, false, NOW()),
('farmer2@example.com', 'farmer2', 'فاطمة أحمد', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', '+966501234569', 'مزارعة متخصصة في الفواكه', 'الطائف، المملكة العربية السعودية', true, true, false, NOW());

-- Insert sample farms
INSERT INTO farms (name, description, location, area_hectares, soil_type, climate_zone, irrigation_system, status, owner_id, created_at) VALUES
('المزرعة الشمالية', 'مزرعة متخصصة في زراعة الخضروات والفواكه باستخدام أحدث التقنيات الزراعية', 'الرياض، المملكة العربية السعودية', 25.5, 'طيني', 'صحراوي', 'ري بالتنقيط', 'active', 2, NOW()),
('المزرعة الجنوبية', 'مزرعة حديثة تستخدم تقنيات الزراعة الذكية', 'الدمام، المملكة العربية السعودية', 18.2, 'رملية', 'ساحلي', 'ري بالرش', 'active', 2, NOW()),
('مزرعة الوادي', 'مزرعة تقليدية في طور التحول للزراعة الذكية', 'الطائف، المملكة العربية السعودية', 32.1, 'طيني رملية', 'جبلي', 'ري بالغمر', 'maintenance', 3, NOW());

-- Insert sample farm zones
INSERT INTO farm_zones (name, description, area_hectares, soil_ph, soil_moisture, fertility_level, farm_id, created_at) VALUES
('المنطقة أ', 'منطقة زراعة الخضروات', 8.5, 6.8, 45.2, 'high', 1, NOW()),
('المنطقة ب', 'منطقة زراعة الفواكه', 12.0, 7.2, 38.7, 'medium', 1, NOW()),
('المنطقة ج', 'منطقة تجريبية', 5.0, 6.5, 52.1, 'high', 1, NOW()),
('المنطقة الشمالية', 'منطقة زراعة القمح', 10.2, 7.0, 42.3, 'medium', 2, NOW()),
('المنطقة الجنوبية', 'منطقة زراعة الخضروات', 8.0, 6.8, 48.7, 'high', 2, NOW());

-- Insert sample crops
INSERT INTO crops (name, variety, description, crop_type, scientific_name, planting_date, expected_harvest_date, status, planted_area_hectares, expected_yield_kg, farm_id, zone_id, created_at) VALUES
('طماطم', 'هجين', 'طماطم عالية الإنتاجية', 'vegetables', 'Solanum lycopersicum', '2024-01-15', '2024-04-15', 'flowering', 2.5, 5000, 1, 1, NOW()),
('خس', 'أخضر', 'خس طازج للاستهلاك المحلي', 'vegetables', 'Lactuca sativa', '2024-01-20', '2024-03-20', 'mature', 1.0, 2000, 1, 1, NOW()),
('برتقال', 'محلي', 'برتقال حلو المذاق', 'fruits', 'Citrus sinensis', '2023-12-01', '2024-06-01', 'fruiting', 3.0, 8000, 1, 2, NOW()),
('قمح', 'محلي', 'قمح عالي الجودة', 'cereals', 'Triticum aestivum', '2024-01-10', '2024-05-10', 'vegetative', 5.0, 8000, 2, 4, NOW()),
('بصل', 'أحمر', 'بصل للتصدير', 'vegetables', 'Allium cepa', '2024-01-25', '2024-05-25', 'planted', 2.0, 4000, 2, 5, NOW());

-- Insert sample sensors
INSERT INTO sensors (name, description, device_id, sensor_type, manufacturer, model, latitude, longitude, altitude, installation_date, measurement_unit, min_value, max_value, accuracy, status, is_online, battery_level, signal_strength, communication_protocol, data_transmission_interval, farm_id, created_at) VALUES
('مستشعر رطوبة التربة - المنطقة أ', 'مستشعر لقياس رطوبة التربة', 'SOIL_MOISTURE_001', 'soil_moisture', 'Sensirion', 'SHT30', 24.7136, 46.6753, 600, '2024-01-01', '%', 0, 100, 2.0, 'active', true, 85, -65, 'LoRa', 300, 1, NOW()),
('مستشعر درجة الحرارة', 'مستشعر لقياس درجة الحرارة', 'TEMP_001', 'temperature', 'Bosch', 'BME280', 24.7136, 46.6753, 600, '2024-01-01', '°C', -40, 85, 1.0, 'active', true, 92, -58, 'LoRa', 300, 1, NOW()),
('مستشعر الرطوبة الجوية', 'مستشعر لقياس الرطوبة الجوية', 'HUMIDITY_001', 'humidity', 'Sensirion', 'SHT30', 24.7136, 46.6753, 600, '2024-01-01', '%', 0, 100, 2.0, 'maintenance', false, 15, -85, 'LoRa', 300, 1, NOW()),
('مستشعر حموضة التربة', 'مستشعر لقياس حموضة التربة', 'PH_001', 'soil_ph', 'Atlas Scientific', 'pH Kit', 26.4207, 50.0888, 10, '2024-01-05', 'pH', 0, 14, 0.1, 'active', true, 78, -72, 'LoRa', 600, 2, NOW()),
('مستشعر الإضاءة', 'مستشعر لقياس شدة الإضاءة', 'LIGHT_001', 'light', 'Adafruit', 'TSL2561', 26.4207, 50.0888, 10, '2024-01-05', 'lux', 0, 40000, 5.0, 'active', true, 88, -60, 'LoRa', 300, 2, NOW());

-- Insert sample sensor readings
INSERT INTO sensor_readings (sensor_id, value, unit, quality_score, reading_timestamp, temperature, humidity, metadata, created_at) VALUES
(1, 45.2, '%', 95, NOW() - INTERVAL '5 minutes', 28.5, 65, '{"location": "zone_a"}', NOW()),
(1, 44.8, '%', 94, NOW() - INTERVAL '10 minutes', 28.3, 66, '{"location": "zone_a"}', NOW()),
(2, 28.5, '°C', 98, NOW() - INTERVAL '2 minutes', 28.5, 65, '{"location": "outdoor"}', NOW()),
(2, 28.3, '°C', 97, NOW() - INTERVAL '7 minutes', 28.3, 66, '{"location": "outdoor"}', NOW()),
(4, 6.8, 'pH', 96, NOW() - INTERVAL '15 minutes', 26.2, 72, '{"location": "zone_north"}', NOW()),
(5, 8500, 'lux', 92, NOW() - INTERVAL '3 minutes', 26.2, 72, '{"location": "outdoor"}', NOW());

-- Insert sample satellite data
INSERT INTO satellite_data (satellite_type, data_type, acquisition_date, cloud_coverage, sun_elevation, sun_azimuth, center_latitude, center_longitude, image_url, thumbnail_url, is_processed, processing_status, quality_score, resolution_meters, farm_id, created_at) VALUES
('sentinel_2', 'optical', '2024-01-20', 5.2, 45.6, 180.3, 24.7136, 46.6753, '/api/satellite/images/sentinel_2_001.jpg', '/api/satellite/thumbnails/sentinel_2_001_thumb.jpg', true, 'completed', 95, 10, 1, NOW()),
('landsat_8', 'multispectral', '2024-01-18', 12.8, 42.1, 175.8, 26.4207, 50.0888, '/api/satellite/images/landsat_8_001.jpg', '/api/satellite/thumbnails/landsat_8_001_thumb.jpg', true, 'completed', 88, 30, 2, NOW()),
('sentinel_1', 'radar', '2024-01-15', 0, 38.9, 170.2, 21.3891, 40.4524, '/api/satellite/images/sentinel_1_001.jpg', '/api/satellite/thumbnails/sentinel_1_001_thumb.jpg', false, 'pending', 92, 5, 3, NOW());

-- Insert sample weather data
INSERT INTO weather_data (farm_id, latitude, longitude, temperature_celsius, humidity_percent, pressure_hpa, wind_speed_kmh, wind_direction_degrees, rainfall_mm, solar_radiation_wm2, data_source, forecast_hours, measurement_time, created_at) VALUES
(1, 24.7136, 46.6753, 28.5, 65, 1013.2, 12.5, 180, 0, 850, 'satellite', 0, NOW(), NOW()),
(1, 24.7136, 46.6753, 30.2, 58, 1012.8, 15.3, 185, 0, 920, 'satellite', 6, NOW() + INTERVAL '6 hours', NOW()),
(2, 26.4207, 50.0888, 26.2, 72, 1014.5, 8.7, 165, 0, 780, 'satellite', 0, NOW(), NOW()),
(2, 26.4207, 50.0888, 28.8, 68, 1014.1, 11.2, 170, 0, 850, 'satellite', 12, NOW() + INTERVAL '12 hours', NOW());