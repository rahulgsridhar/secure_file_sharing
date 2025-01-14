# main.py

from fastapi import FastAPI, Depends, HTTPException,UploadFile, File, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import db
import models, crud
import schemas
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi.responses import StreamingResponse
from io import BytesIO
import mimetypes
from jwt import PyJWTError as JWTError
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64
import hashlib
import uuid
import ssl
# Define database file path (current directory)
DB_PATH = "sqlite:///./secure_file_db.db"

# Create the SQLAlchemy engine
engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize the FastAPI app
app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database and create tables if they don't exist
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database and tables initialized successfully!")
    except Exception as e:
        print(f"Error during database initialization: {e}")

# Run database initialization when the app starts
@app.on_event("startup")
def startup_event():
    init_db()

# Sample route to test
@app.get("/")
def read_root():
    return {"message": "Welcome to the Secure File Sharing API"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Allow all headers including content-disposition
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# # Database session
# def get_db():
#     db_session = db.SessionLocal()
#     try:
#         yield db_session
#     finally:
#         db_session.close()

# JWT Secret
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_from_db(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_file_from_database(file_id: int, db: Session):
    # Fetch file from database by ID
    file = db.query(models.File).filter(models.File.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Return the file object directly
    return file
def encrypt_file(file_content: bytes, encryption_key: str) -> bytes:
    # Ensure the encryption key is 32 bytes (256 bits) for AES-256
    key = hashlib.sha256(encryption_key.encode('utf-8')).digest()  # Hash the key to 32 bytes

    # Generate a random 16-byte IV for AES encryption
    iv = get_random_bytes(AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv)

    # Ensure the file content is a multiple of AES.block_size
    padding_length = AES.block_size - len(file_content) % AES.block_size
    file_content += bytes([padding_length]) * padding_length  # Add padding

    encrypted_data = cipher.encrypt(file_content)
    
    # Return encrypted file with IV concatenated (stored as base64)
    return base64.b64encode(iv + encrypted_data)



def decrypt_file(encrypted_data: bytes, encryption_key: str) -> bytes:
    # Ensure the encryption key is 32 bytes (256 bits) for AES-256
    key = hashlib.sha256(encryption_key.encode('utf-8')).digest()  # Hash the key to 32 bytes

    encrypted_data = base64.b64decode(encrypted_data)
    iv = encrypted_data[:AES.block_size]
    encrypted_content = encrypted_data[AES.block_size:]

    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_content = cipher.decrypt(encrypted_content)

    # Remove padding
    padding_length = decrypted_content[-1]
    return decrypted_content[:-padding_length]  # Remove padding




def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # Decode and validate the token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

def require_role(role: str):
    def role_checker(user: schemas.User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user
    return role_checker

# Routes

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    """
    Get a list of all users.

    Args:
        db (Session): Database session.

    Returns:
        List[dict]: List of users with their details.
    """
    users = db.query(models.User).all()
    return [{"id": user.id, "username": user.username, "role": user.role,"email":user.email} for user in users]


@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(user: schemas.User, db: Session = Depends(get_db)):
    db_user = get_user_from_db(db, user.username)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=schemas.LoginResponse)
async def login(user_credentials: schemas.LoginRequest,response: Response, db: Session = Depends(get_db)):
    # Find user by email
    db_user = get_user_by_email(db, user_credentials.email)
    if not db_user or not verify_password(user_credentials.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": db_user.email})

    # Set token in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Use Secure cookies
        samesite="Strict",  # Prevent CSRF attacks
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username,
        "email": db_user.email,
        "message": "Login successful",
        "role": db_user.role
    }

@app.get("/profile", response_model=schemas.ProfileResponse)
async def read_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        db_user = get_user_from_db(db, username)
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"Hello, {db_user.username}"}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/register", response_model=schemas.RegisterResponse)
async def register(user: schemas.User, db: Session = Depends(get_db)):
    db_user = get_user_from_db(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    # Assign role, defaulting to "Regular User"
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=user.role if user.role else "Regular User"  # Optional role from input
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "username": new_user.username, "email": new_user.email, "role": new_user.role}

@app.post("/upload_file")
async def upload_file(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Read file content
        file_content = await file.read()

        # Encrypt file content before storing
        encryption_key = "your_secure_key_256"  # Use a proper key management system for real apps
        encrypted_content = encrypt_file(file_content, encryption_key)

        # Store metadata in database
        new_file = models.File(
            file_name=file.filename,
            file_data=encrypted_content,
            encryption_key=encryption_key,  # Store or manage the key securely
            owner_id=user.id,
        )
        db.add(new_file)
        db.commit()

        return {"message": "File uploaded successfully", "file_name": file.filename}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        db.close()


@app.get("/files", response_model=List[schemas.FileMetadata])
async def get_user_files(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        # Decode and validate token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch the user from the database
        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch the user's files from the database (without file_data)
        files = db.query(models.File.id, models.File.file_name).filter(models.File.owner_id == user.id).all()
        
        # Return a list of FileMetadata models
        return files
    
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/files/{file_id}")
async def get_file(file_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # Decode and validate the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch the user from the database
        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Fetch the file from the database by ID
        file = db.query(models.File).filter(models.File.id == file_id).first()
        if file is None or file.owner_id != user.id:
            raise HTTPException(status_code=404, detail="File not found or access forbidden")
        
        # Decrypt the file data
        decrypted_content = decrypt_file(file.file_data, file.encryption_key)

        # Guess MIME type and create streaming response
        mime_type, _ = mimetypes.guess_type(file.file_name)
        if not mime_type:
            mime_type = 'application/octet-stream'

        response = StreamingResponse(BytesIO(decrypted_content), media_type=mime_type)
        response.headers["Content-Disposition"] = f"attachment; filename={file.file_name}"
        
        return response
    
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.delete("/files/{file_id}", status_code=204)
async def delete_file(file_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    # Fetch the user from the database
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not user or user.role != "Admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if the file exists
    file = crud.get_file_by_id(file_id, db)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Proceed to delete the file from the database
    crud.delete_file(file_id, db)

    return {"message": "File deleted successfully"}


# Share file endpoint
@app.post("/share_file", response_model=schemas.ShareLinkResponse)
async def share_file(share_request: schemas.ShareLinkRequest, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Retrieve the file to be shared
    file = db.query(models.File).filter(models.File.id == share_request.file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Validate permissions
    if share_request.permission not in ['view', 'download']:
        raise HTTPException(status_code=400, detail="Invalid permission type")

    # Create share link expiration time
    expiration_time = datetime.utcnow() + timedelta(minutes=share_request.expiration_minutes)

    # Generate a unique link ID (UUID)
    link_id = str(uuid.uuid4())

    # Convert list to comma-separated string
    user_ids_str = ",".join(map(str, share_request.user_ids))

    # Create the new share link with the comma-separated user IDs
    new_share_link = models.ShareLink(
        link_id=link_id,
        file_id=share_request.file_id,
        permission=share_request.permission,
        expiration_time=expiration_time,
        user_ids=user_ids_str  # Store the user IDs as a string
    )

    db.add(new_share_link)
    db.commit()

    # Return the generated share link and expiration details
    return schemas.ShareLinkResponse(
        link=f"https://yourdomain.com/share/{link_id}",
        expiration_time=expiration_time,
        permission=share_request.permission,
        file_id=share_request.file_id
    )

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")
    


if __name__ == "__main__":
    # Configure SSL context
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile="server.crt", keyfile="server.key")

    # Run Uvicorn server with SSL
    import uvicorn

    uvicorn.run(
        "main:app",  # Refers to the `app` instance in this file
        host="0.0.0.0",
        port=443,  # HTTPS port
        ssl_context=ssl_context,  # Pass the SSL context
    )

