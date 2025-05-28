#!/bin/bash

# Script to promote a user to ADMIN role
# Usage: ./promote-admin.sh user@example.com

if [ -z "$1" ]; then
  echo "Error: Email address is required"
  echo "Usage: $0 user@example.com"
  exit 1
fi

# The email address to promote
EMAIL=$1

# Load environment variables
if [ -f "../backend.env" ]; then
  source "../backend.env"
else
  source "./backend.env"
fi

# Extract database credentials from environment variables
DB_URL=${POSTGRES_URL:-jdbc:postgresql://localhost:5432/tradingapp}
DB_USER=${POSTGRES_USER:-postgres}
DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}

# Parse the database URL to get the database name
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Promoting user $EMAIL to ADMIN role..."

# SQL to promote user to admin role
SQL="
-- Find user_id by email
WITH user_data AS (
  SELECT id FROM users WHERE email = '$EMAIL'
),
-- Find admin role ID
role_data AS (
  SELECT id FROM roles WHERE name = 'ROLE_ADMIN'
)
-- Insert user_role entry if it doesn't exist
INSERT INTO user_roles (user_id, role_id)
SELECT user_data.id, role_data.id
FROM user_data, role_data
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN user_data ud ON ur.user_id = ud.id
  JOIN role_data rd ON ur.role_id = rd.id
);
"

# Execute SQL command
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$SQL"

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "✓ User promotion successful"
else
  echo "✗ User promotion failed"
  exit 1
fi 