"""
Celery configuration for background tasks
"""

from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "adham_agritech",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.satellite_tasks",
        "app.tasks.sensor_tasks",
        "app.tasks.analytics_tasks",
        "app.tasks.notification_tasks",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Riyadh",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Periodic tasks
celery_app.conf.beat_schedule = {
    "fetch-satellite-data": {
        "task": "app.tasks.satellite_tasks.fetch_satellite_data",
        "schedule": 86400.0,  # Daily
    },
    "process-sensor-data": {
        "task": "app.tasks.sensor_tasks.process_sensor_data",
        "schedule": 300.0,  # Every 5 minutes
    },
    "generate-analytics": {
        "task": "app.tasks.analytics_tasks.generate_daily_analytics",
        "schedule": 3600.0,  # Hourly
    },
    "send-notifications": {
        "task": "app.tasks.notification_tasks.send_daily_reports",
        "schedule": 86400.0,  # Daily
    },
}