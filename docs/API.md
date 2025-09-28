# Adham AgriTech API Documentation

## Overview
The Adham AgriTech API provides comprehensive endpoints for managing smart agriculture operations, including farm management, crop monitoring, sensor data collection, and satellite imagery analysis.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users
- `GET /users/me` - Get current user information
- `PUT /users/me` - Update current user
- `GET /users/` - Get all users (admin only)

### Farms
- `GET /farms/` - Get all farms
- `POST /farms/` - Create new farm
- `GET /farms/{id}` - Get farm by ID
- `PUT /farms/{id}` - Update farm
- `DELETE /farms/{id}` - Delete farm
- `GET /farms/{id}/zones` - Get farm zones
- `POST /farms/{id}/zones` - Create farm zone

### Crops
- `GET /crops/` - Get all crops
- `POST /crops/` - Create new crop
- `GET /crops/{id}` - Get crop by ID
- `PUT /crops/{id}` - Update crop
- `DELETE /crops/{id}` - Delete crop

### Sensors
- `GET /sensors/` - Get all sensors
- `POST /sensors/` - Create new sensor
- `GET /sensors/{id}` - Get sensor by ID
- `PUT /sensors/{id}` - Update sensor
- `DELETE /sensors/{id}` - Delete sensor
- `GET /sensors/{id}/readings` - Get sensor readings

### Satellite Data
- `GET /satellite/data` - Get satellite data
- `GET /satellite/data/{id}` - Get satellite data by ID
- `GET /satellite/analyses` - Get satellite analyses
- `GET /satellite/vegetation-indices` - Get vegetation indices
- `POST /satellite/request-imagery` - Request new satellite imagery

### Weather
- `GET /weather/current` - Get current weather
- `GET /weather/forecast` - Get weather forecast
- `GET /weather/history` - Get weather history
- `POST /weather/update` - Update weather data

### Analytics
- `GET /analytics/farm/{id}` - Get farm analytics
- `GET /analytics/crop/{id}` - Get crop analytics
- `GET /analytics/sensors/{id}` - Get sensor analytics
- `GET /analytics/satellite/{id}` - Get satellite analytics
- `GET /analytics/dashboard` - Get dashboard data

## Data Models

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "phone": "+966501234567",
  "bio": "User bio",
  "location": "Riyadh, Saudi Arabia",
  "is_active": true,
  "is_verified": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T00:00:00Z"
}
```

### Farm
```json
{
  "id": 1,
  "name": "Farm Name",
  "description": "Farm description",
  "location": "Riyadh, Saudi Arabia",
  "area_hectares": 25.5,
  "soil_type": "clay",
  "climate_zone": "desert",
  "irrigation_system": "drip",
  "status": "active",
  "owner_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Crop
```json
{
  "id": 1,
  "name": "Tomato",
  "variety": "Hybrid",
  "description": "High-yield tomato",
  "crop_type": "vegetables",
  "scientific_name": "Solanum lycopersicum",
  "planting_date": "2024-01-15T00:00:00Z",
  "expected_harvest_date": "2024-04-15T00:00:00Z",
  "status": "flowering",
  "planted_area_hectares": 2.5,
  "expected_yield_kg": 5000,
  "farm_id": 1,
  "zone_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Sensor
```json
{
  "id": 1,
  "name": "Soil Moisture Sensor",
  "description": "Soil moisture monitoring",
  "device_id": "SOIL_MOISTURE_001",
  "sensor_type": "soil_moisture",
  "manufacturer": "Sensirion",
  "model": "SHT30",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "altitude": 600,
  "measurement_unit": "%",
  "min_value": 0,
  "max_value": 100,
  "accuracy": 2.0,
  "status": "active",
  "is_online": true,
  "battery_level": 85,
  "signal_strength": -65,
  "communication_protocol": "LoRa",
  "data_transmission_interval": 300,
  "farm_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Satellite Data
```json
{
  "id": 1,
  "satellite_type": "sentinel_2",
  "data_type": "optical",
  "acquisition_date": "2024-01-20T00:00:00Z",
  "cloud_coverage": 5.2,
  "sun_elevation": 45.6,
  "sun_azimuth": 180.3,
  "center_latitude": 24.7136,
  "center_longitude": 46.6753,
  "image_url": "/api/satellite/images/sentinel_2_001.jpg",
  "thumbnail_url": "/api/satellite/thumbnails/sentinel_2_001_thumb.jpg",
  "is_processed": true,
  "processing_status": "completed",
  "quality_score": 95,
  "resolution_meters": 10,
  "farm_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials",
  "message": "Invalid authentication token"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions",
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found",
  "message": "The requested resource does not exist"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting
- API requests are limited to 10 requests per second per IP
- Login attempts are limited to 1 request per second per IP
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Pagination
List endpoints support pagination with the following parameters:
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 100, max: 1000)

## Filtering
Many endpoints support filtering with query parameters:
- `farm_id`: Filter by farm ID
- `status`: Filter by status
- `sensor_type`: Filter by sensor type
- `days`: Filter by time range (last N days)

## Examples

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password"
```

### Get Farms
```bash
curl -X GET "http://localhost:8000/api/v1/farms/" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create Farm
```bash
curl -X POST "http://localhost:8000/api/v1/farms/" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Farm",
    "description": "A new farm",
    "location": "Riyadh, Saudi Arabia",
    "area_hectares": 10.0,
    "owner_id": 1
  }'
```

## WebSocket Support
Real-time updates are available via WebSocket connections:
- `ws://localhost:8000/ws/sensors` - Real-time sensor data
- `ws://localhost:8000/ws/alerts` - Real-time alerts and notifications

## SDKs and Libraries
- Python: `pip install adham-agritech-sdk`
- JavaScript: `npm install @adham-agritech/sdk`
- PHP: `composer require adham-agritech/sdk`

## Support
For API support and questions:
- Email: api-support@adham-agritech.com
- Documentation: https://docs.adham-agritech.com
- GitHub: https://github.com/adham-younes/Adham-AgriTech