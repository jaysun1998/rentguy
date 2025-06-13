# RentGuy - Property Management System

RentGuy is a comprehensive property management system designed to streamline property management tasks, tenant communication, and maintenance requests.

## Features

- User authentication and authorization
- Property and unit management
- Tenant management
- Maintenance request tracking
- Invoice and payment processing
- Reporting and analytics

## Prerequisites

- Docker and Docker Compose
- Python 3.9+
- Node.js 16+ (for frontend development)
- PostgreSQL 13+

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/rentguy.git
cd rentguy
```

### 2. Set up environment variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/rentguy_dev

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# First Superuser
FIRST_SUPERUSER_EMAIL=admin@example.com
FIRST_SUPERUSER_PASSWORD=changeme
FIRST_SUPERUSER_FIRST_NAME=Admin
FIRST_SUPERUSER_LAST_NAME=User
```

### 3. Start the application with Docker Compose

```bash
docker-compose up --build
```

This will start the following services:
- Backend API (FastAPI) on port 8000
- Frontend (Vite/React) on port 5173
- PostgreSQL database on port 5432
- PgAdmin (database management) on port 5050

### 4. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- PgAdmin: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

## Development

### Backend Development

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Database Migrations

To create a new migration:

```bash
alembic revision --autogenerate -m "Your migration message"
```

To apply migrations:

```bash
alembic upgrade head
```

## Deployment

### Production Deployment

1. Set up environment variables for production
2. Build and start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection URL | `postgresql://postgres:postgres@db:5432/rentguy_dev` |
| `SECRET_KEY` | Secret key for JWT | - |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `FIRST_SUPERUSER_EMAIL` | First admin email | - |
| `FIRST_SUPERUSER_PASSWORD` | First admin password | - |
| `FIRST_SUPERUSER_FIRST_NAME` | First admin first name | - |
| `FIRST_SUPERUSER_LAST_NAME` | First admin last name | - |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
