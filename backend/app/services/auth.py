"""
Authentication service with JWT tokens.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.database import get_db
from app. models.merchant import Merchant
from app.schemas.merchant import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password:  str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password:  str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data. copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt. encode(to_encode, settings. SECRET_KEY, algorithm=settings. JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    try: 
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        merchant_id: int = payload.get("sub")
        if merchant_id is None:
            return None
        return TokenData(merchant_id=merchant_id)
    except JWTError:
        return None


async def get_current_merchant(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Merchant:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_token(token)
    if token_data is None or token_data.merchant_id is None:
        raise credentials_exception
    
    merchant = db.query(Merchant).filter(Merchant.id == token_data.merchant_id).first()
    if merchant is None:
        raise credentials_exception
    
    if not merchant.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    return merchant


def authenticate_merchant(db: Session, email: str, password: str) -> Optional[Merchant]:
    merchant = db.query(Merchant).filter(Merchant.email == email).first()
    if not merchant: 
        return None
    if not verify_password(password, merchant.hashed_password):
        return None
    return merchant