import sqlite3
import os

# Path to the SQLite database file
db_path = 'secure_file_db.db'

# Check if the database file already exists
if not os.path.exists(db_path):
    # Connect to SQLite database (this will create the file if it doesn't exist)
    conn = sqlite3.connect(db_path)
    
    # Create a cursor object
    cursor = conn.cursor()
    
    # Create 'users' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );
    """)

    # Create 'files' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        encryption_key TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    # Create 'shared_files' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shared_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        access_type TEXT NOT NULL,
        expiration_date TIMESTAMP,
        FOREIGN KEY(file_id) REFERENCES files(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    # Commit and close the connection
    conn.commit()
    conn.close()
    print("Database and tables initialized successfully!")
else:
    print("Database already exists.")
