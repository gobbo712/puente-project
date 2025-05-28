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

- Frontend environment variables can be set in `.env` files
- Backend environment variables are in `backend/backend.env`

## License

[Your License Here]
