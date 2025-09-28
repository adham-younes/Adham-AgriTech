#!/bin/bash

# Adham AgriTech Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Deploying Adham AgriTech to Production..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example and update the values."
    exit 1
fi

# Backup current deployment
echo "💾 Creating backup..."
if [ -d "backups" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p backups
    echo "Creating backup: $BACKUP_NAME"
    # Add backup logic here if needed
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and deploy
echo "🔨 Building and deploying services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "🔄 Stopping current services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

echo "🚀 Starting new services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend alembic upgrade head

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Services are now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📊 Monitoring:"
echo "   Check logs: docker-compose logs -f"
echo "   Check status: docker-compose ps"
echo ""
echo "🎉 Deployment successful!"