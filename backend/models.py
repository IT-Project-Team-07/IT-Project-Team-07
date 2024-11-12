from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base
from database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True)
    revoked_at = Column(DateTime, default=datetime.utcnow)
Base.metadata.create_all(bind=engine)