"""
Authentication services
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import structlog

from app.core.config import settings
from app.models.user import User
from app.schemas.auth import UserCreate

logger = structlog.get_logger()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user"""
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            logger.warning("Authentication failed: user not found", username=username)
            return None
            
        if not verify_password(password, user.hashed_password):
            logger.warning("Authentication failed: invalid password", username=username)
            return None
            
        if not user.is_active:
            logger.warning("Authentication failed: user inactive", username=username)
            return None
            
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        logger.info("User authenticated successfully", username=username)
        return user
        
    except Exception as e:
        logger.error("Authentication error", username=username, error=str(e))
        return None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            if existing_user.email == user_data.email:
                raise ValueError("البريد الإلكتروني مستخدم بالفعل")
            else:
                raise ValueError("اسم المستخدم مستخدم بالفعل")
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            phone=user_data.phone,
            bio=user_data.bio,
            location=user_data.location,
            is_active=True,
            is_verified=False,
            is_superuser=False
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info("User created successfully", username=user.username, email=user.email)
        return user
        
    except ValueError:
        raise
    except Exception as e:
        db.rollback()
        logger.error("Failed to create user", error=str(e))
        raise Exception("فشل في إنشاء المستخدم")


def get_current_user(db: Session, token: str) -> User:
    """Get current user from JWT token"""
    credentials_exception = Exception("Could not validate credentials")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
            
        return user
        
    except JWTError:
        raise credentials_exception