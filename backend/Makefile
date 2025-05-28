.PHONY: run clean build

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

# Help
help:
	@echo "Available targets:"
	@echo "  run    - Start the application (default)"
	@echo "  clean  - Clean the project"
	@echo "  build  - Build the project"
	@echo "  init   - Initialize Maven wrapper"
	@echo "  help   - Show this help message" 