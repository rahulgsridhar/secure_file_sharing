# backend/db.py
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, text
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
import os
from sqlalchemy.pool import StaticPool
# Load environment variables from .env file
load_dotenv()

# Retrieve database URL from environment variables
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



# Function to initialize the database and tables
def init_db():
    try:
        # Check if the database file exists by trying to connect to it
        with engine.connect() as conn:
            # Execute a valid SQL query using text()
            conn.execute(text("SELECT 1"))
        print("Database connection successful")
    except OperationalError:
        print("Database does not exist, creating new one...")
        # Create the database and tables
        Base.metadata.create_all(bind=engine)
        print("Database and tables created successfully")

# Call the init_db function to check or create the database
init_db()
