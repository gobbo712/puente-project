.PHONY: all start-frontend start-backend start stop clean build help admin docker-start docker-stop docker-build docker-clean docker-admin

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

# Promote a user to ADMIN role in Docker environment
docker-admin:
	@if [ -z "$(email)" ]; then \
		echo "Error: Email address is required"; \
		echo "Usage: make docker-admin email=user@example.com"; \
		exit 1; \
	fi
	@echo "Promoting user $(email) to ADMIN role in Docker environment..."
	@docker compose exec -T db psql -U postgres -d tradingapp -c "INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email='$(email)' AND r.name='ROLE_ADMIN' AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id=u.id AND ur.role_id=r.id);"
	@echo "User promotion command executed. Check logs for results."

# Start services with Docker Compose
docker-start:
	@echo "Starting services with Docker Compose..."
	@docker compose up -d
	@echo "Services started on http://localhost"

# Stop Docker Compose services
docker-stop:
	@echo "Stopping Docker Compose services..."
	@docker compose down
	@echo "Services stopped"

# Build Docker images
docker-build:
	@echo "Building Docker images..."
	@docker compose build
	@echo "Docker images built"

# Clean Docker resources
docker-clean:
	@echo "Cleaning Docker resources..."
	@docker compose down -v
	@echo "Docker resources cleaned"

# Help
help:
	@echo "Puente Trading App - Makefile Help"
	@echo "=================================="
	@echo "Available targets:"
	@echo "  all           - Default target, same as 'start'"
	@echo "  start         - Start both frontend and backend services"
	@echo "  stop          - Stop services"
	@echo "  clean         - Clean both projects"
	@echo "  build         - Build both projects"
	@echo "  install       - Install dependencies for both projects"
	@echo "  admin         - Promote a user to ADMIN role (usage: make admin email=user@example.com)"
	@echo "  docker-start  - Start services with Docker Compose"
	@echo "  docker-stop   - Stop Docker Compose services"
	@echo "  docker-build  - Build Docker images"
	@echo "  docker-clean  - Clean Docker resources including volumes"
	@echo "  docker-admin  - Promote a user to ADMIN role in Docker (usage: make docker-admin email=user@example.com)"
	@echo "  help          - Show this help message"
	@echo ""
	@echo "Individual service targets:"
	@echo "  start-frontend - Start only the frontend"
	@echo "  start-backend  - Start only the backend" 