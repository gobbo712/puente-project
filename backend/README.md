# Trading App Backend

This is a Spring Boot application that provides a REST API for a trading application with JWT authentication and market data.

## Features

- JWT authentication with Spring Security
- PostgreSQL integration
- REST API for a trading app
- Role-based access control (USER and ADMIN)
- Market data background service that fetches data from Alpha Vantage API

## Requirements

- Java 17 or higher
- Maven
- PostgreSQL

## Configuration

All configuration is stored in `backend.env` file. You need to set the following environment variables:

- `POSTGRES_URL`: PostgreSQL connection URL
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: Secret key for JWT token generation
- `ALLOWED_ORIGINS`: CORS allowed origins
- `ALPHAVANTAGE_API_KEY`: API key for Alpha Vantage

## Setup

1. Create a PostgreSQL database named `tradingapp`
2. Update the `backend.env` file with your database credentials and Alpha Vantage API key
3. Initialize the Maven wrapper (if not already done):
   ```
   make init
   ```

## Running the Application

```
make run
```

This will source the environment variables from `backend.env` and start the Spring Boot application.

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token

### Market Data

- `GET /api/market/instruments`: Get all instruments
- `GET /api/market/instruments/{symbol}`: Get instrument by symbol

### Favorites

- `GET /api/favorites`: Get user favorites
- `POST /api/favorites`: Add instrument to favorites
- `DELETE /api/favorites/{instrumentId}`: Remove instrument from favorites

## API Documentation

Swagger UI is available at `/api/swagger-ui.html` when the application is running.
