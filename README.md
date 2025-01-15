
# Secure File Sharing Application

This project is a secure file-sharing web application built with a React.js frontend, a FastAPI backend, and an SQLite database. The application allows users to register, log in, upload files, and share them securely.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16.x or later): [Download Node.js](https://nodejs.org/)
- **Python** (v3.9 or later): [Download Python](https://www.python.org/)
- **Docker**: [Download Docker](https://www.docker.com/)
- **Docker Compose**: Docker Desktop includes Docker Compose. Verify its installation with:
  ```bash
  docker-compose --version
  ```

## Project Structure

The repository is structured as follows:

```plaintext
secure_file_sharing/
├── backend/
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rahulgsridhar/secure_file_sharing.git
cd secure_file_sharing
```

### 2. Frontend Setup

Navigate to the `frontend` directory and install the dependencies:

```bash
cd frontend
npm install --force
```

To start the React development server:

```bash
npm start
```

The frontend should now be running at `http://localhost:3000`.

### 3. Backend Setup

Navigate to the `backend` directory, create a virtual environment, and install the dependencies:

```bash
cd ../backend
python -m venv env
# Activate the virtual environment
# On Windows:
env\Scripts\activate
# On Unix or MacOS:
source env/bin/activate
pip install -r requirements.txt
```
Generate SSL/TLS Certificates:
Step 1: Install OpenSSL
If OpenSSL is installed but not recognized, you may need to manually add it to your system's PATH.
Locate the OpenSSL Binary:
By default, OpenSSL is installed in C:\Program Files\OpenSSL-Win64\bin or a similar directory.
Add to System PATH:
Search for "Environment Variables" in the Windows Start menu.
Under System Properties, click Environment Variables.
Find the Path variable under System variables, and click Edit.
Click New, and add the path to the bin folder (e.g., C:\Program Files\OpenSSL-Win64\bin).
Click OK to save.
For local development, generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

To start the FastAPI server:

```bash
uvicorn main:app --host 0.0.0.0 --port 443 --ssl-keyfile server.key --ssl-certfile server.crt --reload
```

The backend API should now be running at `https://localhost:443`.

### 4. Running with Docker Compose

To run both the frontend and backend using Docker Compose:

```bash
cd ..
docker-compose up --build
```

This command will build and start the services defined in the `docker-compose.yml` file. Once completed:

- The frontend will be accessible at `http://localhost:3000`.
- The backend API will be accessible at `https://localhost:443`.

### 5. Environment Variables

Ensure that environment variables are correctly set in both the frontend and backend for proper configuration. For example, the frontend should have the backend API URL set appropriately.

### 6. Database

The application uses SQLite as the database. When uvicorn is ran, database is created automatically and connection is established if database exists.

## Additional Notes

- **Security**: Ensure that all dependencies are up to date to mitigate security vulnerabilities.
- **Testing**: Implement appropriate testing for both frontend and backend components to ensure application stability.
- **Deployment**: For production deployment, consider using a more robust database system and configure the application for scalability and security.

For more detailed information, refer to the respective documentation of the tools and frameworks used in this project.
