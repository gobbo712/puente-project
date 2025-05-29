# Puente Trading App

A full-stack trading application with real-time market data, user authentication, and portfolio tracking.

## Project Structure

- **Frontend**: React application built with Vite, Redux Toolkit, and TailwindCSS
- **Backend**: Spring Boot application with JWT authentication and market data integration

## Prerequisites

- Node.js (v18+)
- Java 17
- Maven
- PostgreSQL

## Quick Start

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/puente-project.git
   cd puente-project
   ```

2. Install dependencies:

   ```
   make install
   ```

3. Set up the database:

   - Create a PostgreSQL database named `tradingapp`
   - Default credentials are in `backend/backend.env` (username: postgres, password: postgres)

4. Start both services:
   ```
   make start
   ```

## Available Make Commands

- `make start` - Start both frontend and backend services
- `make start-frontend` - Start only the frontend
- `make start-backend` - Start only the backend
- `make clean` - Clean both projects
- `make build` - Build both projects
- `make install` - Install dependencies for both projects
- `make help` - Show help message

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- API Documentation: http://localhost:8080/api/swagger-ui.html

## Environment Configuration

Both frontend and backend services use environment files for configuration:

### Backend Configuration

Backend environment variables are configured in `backend/backend.env`:

```
# Sample backend.env file
# Database Configuration
export POSTGRES_URL=jdbc:postgresql://localhost:5432/tradingapp
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres

# JWT Configuration
export JWT_SECRET=puente-trading-app-jwt-secret-key-must-be-at-least-256-bits-long

# CORS Configuration
export ALLOWED_ORIGINS=http://localhost:3000

# Market Data Configuration
export ALPHAVANTAGE_API_KEY=your_api_key_here

# Instruments to track
export STOCK_SYMBOLS=AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,JPM,V,WMT
export CRYPTO_SYMBOLS=BTC,ETH,BNB,XRP,ADA,SOL,DOGE,DOT,AVAX,MATIC
```

### Frontend Configuration

Frontend environment variables are configured in `frontend/frontend.env`:

```
# Sample frontend.env file
# API Configuration
export VITE_API_URL=http://localhost:8080/api

# Authentication Configuration
export VITE_TOKEN_STORAGE_KEY=token
export VITE_USER_STORAGE_KEY=user
export VITE_CREDENTIALS_STORAGE_KEY=credentials

# Application Configuration
export VITE_APP_NAME="Puente Trading App"
export VITE_APP_VERSION="1.0.0"

# Feature Flags
export VITE_ENABLE_DEBUG_MODE=false
export VITE_ENABLE_DEMO_MODE=false
```

**Note:** Both `.env` files are excluded from version control for security reasons. Make sure to create these files locally based on the examples above.

## Docker Deployment

The Puente Trading App can be run in Docker containers using Docker Compose:

### Prerequisites

- Docker and Docker Compose installed on your system

### Running with Docker

1. Build the Docker images:

   ```
   make docker-build
   ```

2. Start the services:

   ```
   make docker-start
   ```

3. Access the application at http://localhost

4. Promote a user to admin (after registering the user):

   ```
   make docker-admin email=user@example.com
   ```

5. Stop the services:

   ```
   make docker-stop
   ```

6. To clean up all Docker resources including volumes:
   ```
   make docker-clean
   ```

## License

[Your License Here]
