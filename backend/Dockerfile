# Use official Python image as base image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Copy the SSL certificates from the backend folder to the container
COPY ./backend/server.key /etc/ssl/private/server.key
COPY ./backend/server.crt /etc/ssl/certs/server.crt

# Expose port 443 for SSL traffic
EXPOSE 443

# Command to run the application using uvicorn with SSL enabled
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "/etc/ssl/private/server.key", "--ssl-certfile", "/etc/ssl/certs/server.crt", "--reload"]