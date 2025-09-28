# Adham AgriTech Deployment Guide

## Overview
This guide covers deploying the Adham AgriTech application to production environments using Docker and Docker Compose.

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 4GB+ RAM
- 20GB+ disk space

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/adham-younes/Adham-AgriTech.git
cd Adham-AgriTech
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Deploy with Docker Compose
```bash
# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## Environment Variables

### Required Variables
```bash
# Database
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://adham:your_secure_password@postgres:5432/adham_agritech

# Redis
REDIS_PASSWORD=your_redis_password

# Security
SECRET_KEY=your_super_secret_key_change_in_production

# API Keys
SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret
NASA_API_KEY=your_nasa_api_key
```

### Optional Variables
```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## Production Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. SSL Certificate Setup
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx.key \
  -out nginx/ssl/nginx.crt

# For production, use Let's Encrypt or commercial certificate
```

### 3. Database Backup
```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec postgres pg_dump -U adham adham_agritech > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x scripts/backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /path/to/Adham-AgriTech/scripts/backup.sh" | crontab -
```

### 4. Monitoring Setup
```bash
# Install monitoring tools
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
# Flower: http://localhost:5555
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale celery-worker=5
```

### Load Balancer Configuration
```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend {
    server frontend:3000;
    server frontend2:3000;
}
```

## Security

### 1. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Database Security
```bash
# Change default passwords
# Use strong, unique passwords
# Enable SSL connections
# Regular security updates
```

### 3. Application Security
```bash
# Use HTTPS in production
# Enable CORS properly
# Implement rate limiting
# Regular security audits
```

## Maintenance

### 1. Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Database Migrations
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Check migration status
docker-compose exec backend alembic current
```

### 3. Log Management
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Log rotation
sudo logrotate -f /etc/logrotate.d/docker
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U adham

# Check database logs
docker-compose logs postgres
```

#### 2. Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.prod.yml
```

#### 3. Disk Space Issues
```bash
# Clean up unused containers and images
docker system prune -a

# Check disk usage
df -h
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_sensors_farm_id ON sensors(farm_id);
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(reading_timestamp);
```

#### 2. Redis Optimization
```bash
# Configure Redis for production
# Increase memory limits
# Enable persistence
# Configure eviction policies
```

#### 3. Application Optimization
```bash
# Enable gzip compression
# Use CDN for static assets
# Implement caching strategies
# Optimize database queries
```

## Backup and Recovery

### 1. Full System Backup
```bash
# Create full backup script
cat > scripts/full_backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/full"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Stop services
docker-compose down

# Backup volumes
docker run --rm -v adham_agritech_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_data_$DATE.tar.gz -C /data .
docker run --rm -v adham_agritech_redis_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_data_$DATE.tar.gz -C /data .

# Backup configuration
cp -r . $BACKUP_DIR/config_$DATE/

# Start services
docker-compose up -d
EOF

chmod +x scripts/full_backup.sh
```

### 2. Recovery Process
```bash
# Restore from backup
docker-compose down
docker run --rm -v adham_agritech_postgres_data:/data -v /backups/full:/backup alpine tar xzf /backup/postgres_data_YYYYMMDD_HHMMSS.tar.gz -C /data
docker-compose up -d
```

## Health Checks

### 1. Application Health
```bash
# Check API health
curl -f http://localhost:8000/health

# Check database health
docker-compose exec postgres pg_isready -U adham

# Check Redis health
docker-compose exec redis redis-cli ping
```

### 2. Monitoring Scripts
```bash
# Create health check script
cat > scripts/health_check.sh << 'EOF'
#!/bin/bash
echo "Checking Adham AgriTech Health..."

# Check API
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API is unhealthy"
    exit 1
fi

# Check database
if docker-compose exec postgres pg_isready -U adham > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is unhealthy"
    exit 1
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is unhealthy"
    exit 1
fi

echo "🎉 All services are healthy!"
EOF

chmod +x scripts/health_check.sh
```

## Support

For deployment support:
- Email: support@adham-agritech.com
- Documentation: https://docs.adham-agritech.com
- GitHub Issues: https://github.com/adham-younes/Adham-AgriTech/issues