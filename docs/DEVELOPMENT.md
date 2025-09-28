# Adham AgriTech Development Guide

## Overview
This guide covers setting up the development environment for the Adham AgriTech application.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git
- PostgreSQL 15+
- Redis 7+

## Quick Start

### 1. Clone and Setup
```bash
# Clone repository
git clone https://github.com/adham-younes/Adham-AgriTech.git
cd Adham-AgriTech

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Create database
createdb adham_agritech

# Run migrations
cd backend
alembic upgrade head
```

## Development Workflow

### 1. Code Structure
```
Adham-AgriTech/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── tasks/          # Background tasks
│   ├── tests/              # Test files
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript types
│   └── package.json
├── database/               # Database files
│   ├── migrations/         # Alembic migrations
│   └── seeds/              # Sample data
└── docs/                   # Documentation
```

### 2. Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 3. Testing

#### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_farms.py

# Run with coverage
pytest --cov=app tests/
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### 4. Code Quality

#### Backend
```bash
cd backend

# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/
```

#### Frontend
```bash
cd frontend

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

## API Development

### 1. Adding New Endpoints
```python
# backend/app/api/api_v1/endpoints/new_endpoint.py
from fastapi import APIRouter, Depends
from app.schemas.new_schema import NewSchema
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NewSchema])
async def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of items"""
    # Implementation here
    pass
```

### 2. Database Models
```python
# backend/app/models/new_model.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class NewModel(Base):
    __tablename__ = "new_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### 3. Pydantic Schemas
```python
# backend/app/schemas/new_schema.py
from pydantic import BaseModel
from datetime import datetime

class NewSchemaBase(BaseModel):
    name: str

class NewSchemaCreate(NewSchemaBase):
    pass

class NewSchemaUpdate(BaseModel):
    name: Optional[str] = None

class NewSchemaResponse(NewSchemaBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Frontend Development

### 1. Adding New Components
```typescript
// frontend/src/components/NewComponent.tsx
import React from 'react';
import { Card } from './Card';

interface NewComponentProps {
  title: string;
  children: React.ReactNode;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, children }) => {
  return (
    <Card>
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </Card>
  );
};
```

### 2. Adding New Pages
```typescript
// frontend/src/pages/NewPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/Card';

export const NewPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['new-data'],
    queryFn: async () => {
      // API call here
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Page</h1>
      {/* Page content */}
    </div>
  );
};
```

### 3. API Services
```typescript
// frontend/src/services/newService.ts
import { api } from './api';
import { NewSchema } from '../types';

export const newService = {
  async getItems(): Promise<NewSchema[]> {
    const response = await api.get('/new-endpoint/');
    return response.data;
  },

  async createItem(data: NewSchema): Promise<NewSchema> {
    const response = await api.post('/new-endpoint/', data);
    return response.data;
  },
};
```

## Database Development

### 1. Creating Migrations
```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### 2. Adding Sample Data
```sql
-- database/seeds/02_new_data.sql
INSERT INTO new_models (name, created_at) VALUES
('Sample Item 1', NOW()),
('Sample Item 2', NOW());
```

## Background Tasks

### 1. Adding New Tasks
```python
# backend/app/tasks/new_tasks.py
from celery import current_task
from app.core.celery import celery_app
import structlog

logger = structlog.get_logger()

@celery_app.task
def new_background_task(param1: str, param2: int):
    """New background task"""
    try:
        logger.info("Starting new task", param1=param1, param2=param2)
        
        # Task implementation here
        
        logger.info("Task completed successfully")
        return {
            'status': 'success',
            'message': 'Task completed successfully'
        }
        
    except Exception as e:
        logger.error("Task failed", error=str(e))
        raise
```

### 2. Scheduling Tasks
```python
# backend/app/core/celery.py
celery_app.conf.beat_schedule = {
    "new-periodic-task": {
        "task": "app.tasks.new_tasks.new_background_task",
        "schedule": 3600.0,  # Every hour
        "args": ("param1", 42)
    },
}
```

## Debugging

### 1. Backend Debugging
```python
# Add breakpoints
import pdb; pdb.set_trace()

# Use logging
import structlog
logger = structlog.get_logger()
logger.info("Debug message", variable=value)
```

### 2. Frontend Debugging
```typescript
// Use browser dev tools
console.log('Debug message', variable);

// Use React DevTools
// Install browser extension for React debugging
```

### 3. Database Debugging
```sql
-- Enable query logging
SET log_statement = 'all';

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Performance Optimization

### 1. Backend Optimization
```python
# Use database indexes
# Optimize queries
# Implement caching
# Use connection pooling
```

### 2. Frontend Optimization
```typescript
// Use React.memo for expensive components
// Implement lazy loading
// Optimize bundle size
// Use service workers
```

### 3. Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_table_column ON table(column);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM table WHERE column = 'value';
```

## Deployment

### 1. Local Testing
```bash
# Test with Docker
docker-compose up -d

# Run tests
docker-compose exec backend pytest
docker-compose exec frontend npm test
```

### 2. Staging Deployment
```bash
# Deploy to staging
./scripts/deploy.sh staging
```

### 3. Production Deployment
```bash
# Deploy to production
./scripts/deploy.sh production
```

## Contributing

### 1. Code Standards
- Follow PEP 8 for Python
- Use ESLint/Prettier for JavaScript/TypeScript
- Write comprehensive tests
- Document all public APIs

### 2. Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Ensure all tests pass
4. Update documentation
5. Create pull request
6. Address review feedback

### 3. Issue Reporting
- Use GitHub issues
- Provide detailed reproduction steps
- Include system information
- Add relevant logs

## Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - Database management
- [Redis Commander](https://github.com/joeferner/redis-commander) - Redis management
- [Flower](https://flower.readthedocs.io/) - Celery monitoring

### Support
- Email: dev@adham-agritech.com
- Slack: #adham-agritech-dev
- GitHub: https://github.com/adham-younes/Adham-AgriTech