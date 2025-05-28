FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace/app

# Copy maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /workspace/app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the application (environment variables come from docker-compose)
CMD ["java", "-jar", "app.jar"] 