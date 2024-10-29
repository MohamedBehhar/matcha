#!/bin/bash

set -e

echo "Waiting for PostgreSQL to become available..."

until pg_isready -h postgres -p 5432 -q; do
    echo "Postgres is unavailable - sleeping"
    sleep 1
done

echo "PostgreSQL is ready. Initializing database..."

PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /app/src/init.sql

echo "- - - - - - - - -  - - - - - - - - - - - - - - - - - - -"

echo "Database initialization completed."

exec "$@"

