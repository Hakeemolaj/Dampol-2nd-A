#!/bin/bash

# Database Migration Runner for Supabase
# This script runs database migrations and seeds for the Barangay Web Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Database Migration Runner${NC}"
echo "================================"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL client (psql) is not installed${NC}"
    echo "Please install PostgreSQL client tools first"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Please create a .env file with your database connection details"
    exit 1
fi

# Source environment variables
source .env

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    echo "Please add your database connection URL to .env:"
    echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
    exit 1
fi

# Parse command line arguments
COMMAND=${1:-"migrate"}
ENVIRONMENT=${2:-"development"}

case $COMMAND in
    "migrate")
        echo -e "${BLUE}🔄 Running database migrations...${NC}"
        ;;
    "seed")
        echo -e "${BLUE}🌱 Running database seeds...${NC}"
        ;;
    "reset")
        echo -e "${BLUE}🔄 Resetting database (migrate + seed)...${NC}"
        ;;
    "rollback")
        echo -e "${BLUE}⏪ Rolling back last migration...${NC}"
        ;;
    *)
        echo "Usage: $0 [migrate|seed|reset|rollback] [environment]"
        echo ""
        echo "Commands:"
        echo "  migrate   - Run pending migrations"
        echo "  seed      - Run database seeds"
        echo "  reset     - Drop all tables and recreate (migrate + seed)"
        echo "  rollback  - Rollback last migration"
        echo ""
        echo "Environments:"
        echo "  development (default)"
        echo "  staging"
        echo "  production"
        exit 1
        ;;
esac

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}📄 Running: $description${NC}"
    
    if [ -f "$file" ]; then
        psql "$DATABASE_URL" -f "$file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Success: $description${NC}"
        else
            echo -e "${RED}❌ Failed: $description${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ File not found: $file${NC}"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    echo -e "${BLUE}🔄 Running migrations...${NC}"
    
    # Create migrations table if it doesn't exist
    psql "$DATABASE_URL" -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    "
    
    # Run each migration file in order
    for migration_file in database/migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            # Extract version from filename
            version=$(basename "$migration_file" .sql)
            
            # Check if migration has already been applied
            applied=$(psql "$DATABASE_URL" -t -c "SELECT version FROM schema_migrations WHERE version = '$version';" | xargs)
            
            if [ -z "$applied" ]; then
                run_sql_file "$migration_file" "Migration: $version"
                
                # Record migration as applied
                psql "$DATABASE_URL" -c "INSERT INTO schema_migrations (version) VALUES ('$version');"
                echo -e "${GREEN}📝 Recorded migration: $version${NC}"
            else
                echo -e "${YELLOW}⏭️  Skipping already applied migration: $version${NC}"
            fi
        fi
    done
}

# Function to run seeds
run_seeds() {
    echo -e "${BLUE}🌱 Running seeds...${NC}"
    
    # Only run seeds in development or if explicitly confirmed
    if [ "$ENVIRONMENT" != "development" ]; then
        echo -e "${YELLOW}⚠️  You are about to run seeds in $ENVIRONMENT environment${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled"
            exit 1
        fi
    fi
    
    # Run each seed file in order
    for seed_file in database/seeds/*.sql; do
        if [ -f "$seed_file" ]; then
            filename=$(basename "$seed_file")
            run_sql_file "$seed_file" "Seed: $filename"
        fi
    done
}

# Function to reset database
reset_database() {
    echo -e "${RED}⚠️  WARNING: This will drop all tables and data!${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}❌ Database reset is not allowed in production${NC}"
        exit 1
    fi
    
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled"
        exit 1
    fi
    
    echo -e "${BLUE}🗑️  Dropping all tables...${NC}"
    
    # Drop all tables (be careful!)
    psql "$DATABASE_URL" -c "
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
    "
    
    echo -e "${GREEN}✅ Database reset complete${NC}"
    
    # Run migrations and seeds
    run_migrations
    run_seeds
}

# Function to rollback last migration
rollback_migration() {
    echo -e "${BLUE}⏪ Rolling back last migration...${NC}"
    
    # Get the last applied migration
    last_migration=$(psql "$DATABASE_URL" -t -c "SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1;" | xargs)
    
    if [ -z "$last_migration" ]; then
        echo -e "${YELLOW}⚠️  No migrations to rollback${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}📄 Last migration: $last_migration${NC}"
    
    # Check if rollback file exists
    rollback_file="database/rollbacks/${last_migration}.sql"
    
    if [ -f "$rollback_file" ]; then
        run_sql_file "$rollback_file" "Rollback: $last_migration"
        
        # Remove migration record
        psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version = '$last_migration';"
        echo -e "${GREEN}📝 Removed migration record: $last_migration${NC}"
    else
        echo -e "${RED}❌ Rollback file not found: $rollback_file${NC}"
        echo "Manual rollback required"
        exit 1
    fi
}

# Execute the requested command
case $COMMAND in
    "migrate")
        run_migrations
        ;;
    "seed")
        run_seeds
        ;;
    "reset")
        reset_database
        ;;
    "rollback")
        rollback_migration
        ;;
esac

echo -e "${GREEN}🎉 Database operation completed successfully!${NC}"

# Generate types after successful migration
if [ "$COMMAND" = "migrate" ] || [ "$COMMAND" = "reset" ]; then
    echo -e "${BLUE}🔄 Generating TypeScript types...${NC}"
    if [ -f "./scripts/generate-types.sh" ]; then
        ./scripts/generate-types.sh
    else
        echo -e "${YELLOW}⚠️  Type generation script not found, skipping...${NC}"
    fi
fi
