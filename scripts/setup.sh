#!/bin/bash

# Adham AgriTech Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Adham AgriTech Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update the values as needed."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p database/backups
mkdir -p logs

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh

# Build and start services
echo "🔨 Building and starting services..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend alembic upgrade head

# Load sample data
echo "📊 Loading sample data..."
docker-compose exec backend python -c "
from app.core.database import init_db
import asyncio
asyncio.run(init_db())
print('Sample data loaded successfully')
"

echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Services are now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Flower (Celery): http://localhost:5555"
echo ""
echo "📚 Next steps:"
echo "   1. Visit http://localhost:3000 to access the application"
echo "   2. Use the API documentation at http://localhost:8000/docs"
echo "   3. Check logs with: docker-compose logs -f"
echo "   4. Stop services with: docker-compose down"
echo ""
echo "🎉 Happy coding!"