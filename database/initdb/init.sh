#!/bin/bash

# Load environment variables from .env file
set -o allexport
export $(grep -v '^#' /docker-entrypoint-initdb.d/.env | xargs)
set +o allexport

# List of SQL files in the order they should be executed
FILES=(
  "/docker-entrypoint-initdb.d/schema/Schema.sql"
  "/docker-entrypoint-initdb.d/data/Semesters.sql"
  "/docker-entrypoint-initdb.d/data/Classes.sql"
  "/docker-entrypoint-initdb.d/data/Grade_Distribution.sql"
  "/docker-entrypoint-initdb.d/data/Grades.sql"
  "/docker-entrypoint-initdb.d/data/Tasks.sql"
)

# Execute each SQL file
for file in "${FILES[@]}"; do
    echo "Executing $file..."
    psql -U "$POSTGRES_USER" \
         -d "$POSTGRES_DB" \
         -v test_user_1="$TEST_USER1_ID" \
         -v test_user_2="$TEST_USER2_ID" \
         -f "$file"
    if [ $? -ne 0 ]; then
        echo "Error executing $file"
        exit 1
    fi
    echo "$file executed successfully."
done

echo "All SQL files executed successfully."