# models.py

from sqlalchemy import Column, Integer, String, ForeignKey,LargeBinary, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# User model
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="Guest")

    # Relationship to other models like files can go here
    files = relationship("File", back_populates="owner")

# File model
class File(Base):
    __tablename__ = 'files'

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)  # File name
    file_data = Column(LargeBinary, nullable=False)  # File content as binary data
    owner_id = Column(Integer, ForeignKey('users.id'))  # Foreign key to User table
    encryption_key = Column(String, nullable=False, default="default_encryption_key")
    permission = Column(String,nullable=True)  # Define permission types (e.g., "read", "write", etc.)
    owner = relationship("User", back_populates="files")
    # Assuming you have a ShareLink model related to File
    share_links = relationship('ShareLink', back_populates='file')
    
# SharedFile model (for file sharing functionality)
class SharedFile(Base):
    __tablename__ = 'shared_files'

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey('files.id'))
    shared_user_id = Column(Integer, ForeignKey('users.id'))
    permission = Column(String)  # Define permission types (e.g., "read", "write", etc.)

    file = relationship("File")
    shared_user = relationship("User")

class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(String, unique=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    permission = Column(String)  # 'view' or 'download'
    expiration_time = Column(DateTime)
    user_ids = Column(String)  # Store user IDs as a comma-separated string (or use a many-to-many relationship)

    file = relationship("File", back_populates="share_links")
