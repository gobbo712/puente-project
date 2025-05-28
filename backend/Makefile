.PHONY: run clean build admin

# Default target
all: run

# Run the application
run:
	@echo "Starting Trading App..."
	@source backend.env && ./mvnw spring-boot:run

# Clean the project
clean:
	@echo "Cleaning project..."
	@./mvnw clean

# Build the project
build:
	@echo "Building project..."
	@./mvnw package -DskipTests

# Initialize Maven wrapper if not present
init:
	@echo "Initializing Maven wrapper..."
	@mvn -N io.takari:maven:wrapper

# Promote user to admin role
admin:
	@if [ -z "$(email)" ]; then \
		echo "Error: Email is required"; \
		echo "Usage: make admin email=user@example.com"; \
		exit 1; \
	fi
	@echo "Promoting user to admin role..."
	@chmod +x scripts/promote-admin.sh
	@scripts/promote-admin.sh $(email)

# Help
help:
	@echo "Available targets:"
	@echo "  run    - Start the application (default)"
	@echo "  clean  - Clean the project"
	@echo "  build  - Build the project"
	@echo "  init   - Initialize Maven wrapper"
	@echo "  admin  - Promote a user to admin role (usage: make admin email=user@example.com)"
	@echo "  help   - Show this help message" 