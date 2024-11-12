import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from models import User, RevokedToken
from database import SessionLocal, get_db
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Registratie van een nieuwe user

class UserCreate(BaseModel):
    username: str
    password: str

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    return "complete"

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)


# Inloggen van user + token aanmaken en meegeven

def authenticate_user(username: str, password:str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user: 
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user 

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password or username",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type":"bearer"}


# Verificatie van een token 

def verify_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token.")
        revoked_token = db.query(RevokedToken).filter(RevokedToken.token == token).first()
        if revoked_token:
            raise HTTPException(status_code=401, detail="Token has been revoked.")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired.")

@app.get("/verify-token/{token}")
async def verify_user_token(token: str, db: Session = Depends(get_db)):
    verify_token(token=token, db=db)
    return {"message": "Token is valid"}


def revoke_token(token: str, db: Session):
    existing_token = db.query(RevokedToken).filter_by(token=token).first()
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has already been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )           
    try:
        revoked_token = RevokedToken(token=token)
        db.add(revoked_token)
        db.commit()
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/revoke-token/{token}")
def revoke_user_token(token: str, db: Session = Depends(get_db)):
    try:
        revoke_token(token, db)
        return {"message": "Token has been revoked."}
    except HTTPException as e:
        raise e