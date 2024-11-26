import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from models import User, RevokedToken, Tree
from database import SessionLocal, get_db
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:3000",
    "*",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This correctly allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in the request
)
    

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def standard_response(success: bool, message: str, data: dict | None = None):
    return {
        "success": success,
        "message": message,
        "data": data
    }

# Registratie van een nieuwe user

class UserCreate(BaseModel):
    username: str
    password: str

class TreeCreate(BaseModel):
    name: str
    description: str | None = None
    latitude: float
    longitude: float

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return standard_response(True, "User created successfully", {"user_id": db_user.id, "username": db_user.username})

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail=standard_response(False, "Username already registered")
        )
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
            detail=standard_response(False, "Incorrect username or password"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return standard_response(True, "Login successful", {"access_token": access_token, "token_type": "bearer"})


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
    return standard_response(True, "Token is valid")


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
        return standard_response(True, "Token has been revoked.")
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=standard_response(False, e.detail)
        )
    
@app.get("/trees")
def get_trees(db: Session = Depends(get_db)):
    trees = db.query(Tree).all()
    return trees

@app.post("/trees")
def create_tree(tree: TreeCreate, db: Session = Depends(get_db)):
    db_tree = Tree(
        name=tree.name,
        description=tree.description,
        latitude=tree.latitude,
        longitude=tree.longitude,
    )
    db.add(db_tree)
    db.commit()
    db.refresh(db_tree)
    return db_tree

@app.delete("/trees/{tree_id}")
def delete_tree(tree_id: int, db: Session = Depends(get_db)):
    db_tree = db.query(Tree).filter(Tree.id == tree_id).first()
    if not db_tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    db.delete(db_tree)
    db.commit()
    return {"message": "Tree deleted successfully"}