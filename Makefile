.PHONY: all start-frontend start-backend start stop clean build help admin

# Default target
all: start

# Start both frontend and backend
start:
	@echo "Starting both frontend and backend services..."
	@make -j 2 start-frontend start-backend

# Start frontend service
start-frontend:
	@echo "Starting frontend service..."
	@cd frontend && npm run dev

# Start backend service
start-backend:
	@echo "Starting backend service..."
	@cd backend && source backend.env && ./mvnw spring-boot:run

# Stop services
stop:
	@echo "Stopping services..."
	@-pkill -f "node.*vite" || true
	@-killall -9 java || true
	@echo "Services stopped"

# Clean both projects
clean:
	@echo "Cleaning projects..."
	@cd frontend && npm run clean || true
	@cd backend && ./mvnw clean

# Build both projects
build:
	@echo "Building projects..."
	@cd frontend && npm run build
	@cd backend && ./mvnw package -DskipTests

# Install dependencies for both projects
install:
	@echo "Installing dependencies..."
	@cd frontend && npm install
	@cd backend && ./mvnw dependency:resolve

# Promote a user to ADMIN role by email address
admin:
	@if [ -z "$(email)" ]; then \
		echo "Error: Email address is required"; \
		echo "Usage: make admin email=user@example.com"; \
		exit 1; \
	fi
	@echo "Promoting user $(email) to ADMIN role..."
	@cd backend/scripts && ./promote-admin.sh $(email)

# Help
help:
	@echo "Puente Trading App - Makefile Help"
	@echo "=================================="
	@echo "Available targets:"
	@echo "  all       - Default target, same as 'start'"
	@echo "  start     - Start both frontend and backend services"
	@echo "  stop      - Stop services"
	@echo "  clean     - Clean both projects"
	@echo "  build     - Build both projects"
	@echo "  install   - Install dependencies for both projects"
	@echo "  admin     - Promote a user to ADMIN role (usage: make admin email=user@example.com)"
	@echo "  help      - Show this help message"
	@echo ""
	@echo "Individual service targets:"
	@echo "  start-frontend - Start only the frontend"
	@echo "  start-backend  - Start only the backend" 