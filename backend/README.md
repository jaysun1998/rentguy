# RentGuy Backend

Backend API for the RentGuy property management system, built with FastAPI and PostgreSQL.

## Features

- User authentication with JWT tokens
- Role-based access control
- RESTful API endpoints
- PostgreSQL database
- Docker support
- Automated testing

## Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Docker (optional)
- Poetry (recommended) or pip

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rentguy.git
   cd rentguy/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development
   ```

4. Create a `.env` file based on `.env.example` and update the values:
   ```bash
   cp .env.example .env
   ```

5. Set up the database:
   ```bash
   # Create the database in PostgreSQL
   createdb rentguy_dev
   
   # Run migrations
   alembic upgrade head
   ```

6. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at http://localhost:8000

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
isort .
flake8
mypy .
```

### Database Migrations

To create a new migration:

```bash
alembic revision --autogenerate -m "Your migration message"
```

To apply migrations:

```bash
alembic upgrade head
```

## API Documentation

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Docker

To run the application with Docker:

```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
