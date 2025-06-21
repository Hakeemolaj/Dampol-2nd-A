#!/bin/bash

# Barangay Web Application Deployment Script
# This script handles deployment to staging and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

# Default values
ENVIRONMENT="staging"
SKIP_TESTS=false
SKIP_BACKUP=false
FORCE_REBUILD=false
DRY_RUN=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy the Barangay Web Application to staging or production environment.

OPTIONS:
    -e, --environment ENV    Target environment (staging|production) [default: staging]
    -s, --skip-tests        Skip running tests before deployment
    -b, --skip-backup       Skip database backup before deployment
    -f, --force-rebuild     Force rebuild of Docker images
    -d, --dry-run          Show what would be done without executing
    -h, --help             Show this help message

EXAMPLES:
    $0                                    # Deploy to staging
    $0 -e production                      # Deploy to production
    $0 -e production -s -b               # Deploy to production, skip tests and backup
    $0 -d                                # Dry run for staging

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -b|--skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        -f|--force-rebuild)
            FORCE_REBUILD=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required environment files exist
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [[ ! -f "$env_file" ]]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi
    
    # Check if required directories exist
    if [[ ! -d "$DEPLOYMENT_DIR" ]]; then
        print_error "Deployment directory not found: $DEPLOYMENT_DIR"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        print_warning "Skipping tests"
        return 0
    fi
    
    print_status "Running tests..."
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would run test suite"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Run backend tests
    print_status "Running backend tests..."
    cd backend
    npm test
    
    # Run frontend tests
    print_status "Running frontend tests..."
    cd ../frontend
    npm test -- --watchAll=false
    
    cd "$PROJECT_ROOT"
    print_success "All tests passed"
}

# Function to backup database
backup_database() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        print_warning "Skipping database backup"
        return 0
    fi
    
    print_status "Creating database backup..."
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would create database backup"
        return 0
    fi
    
    local backup_script="$DEPLOYMENT_DIR/scripts/backup.sh"
    if [[ -f "$backup_script" ]]; then
        bash "$backup_script" "$ENVIRONMENT"
    else
        print_warning "Backup script not found, skipping backup"
    fi
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    local build_args=""
    if [[ "$FORCE_REBUILD" == true ]]; then
        build_args="--no-cache"
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would build Docker images using $compose_file"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$compose_file" build $build_args
    
    print_success "Docker images built successfully"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application to $ENVIRONMENT..."
    
    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would deploy using $compose_file"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Load environment variables
    export $(cat ".env.$ENVIRONMENT" | grep -v '^#' | xargs)
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f "$compose_file" down
    
    # Start new containers
    print_status "Starting new containers..."
    docker-compose -f "$compose_file" up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health "$compose_file"
    
    print_success "Application deployed successfully"
}

# Function to check service health
check_service_health() {
    local compose_file="$1"
    
    print_status "Checking service health..."
    
    local services=("frontend" "backend")
    
    for service in "${services[@]}"; do
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if docker-compose -f "$compose_file" ps "$service" | grep -q "healthy\|Up"; then
                print_success "$service is healthy"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                print_error "$service failed to become healthy"
                return 1
            fi
            
            print_status "Waiting for $service to be healthy (attempt $attempt/$max_attempts)..."
            sleep 10
            ((attempt++))
        done
    done
}

# Function to run post-deployment tasks
post_deployment_tasks() {
    print_status "Running post-deployment tasks..."
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would run post-deployment tasks"
        return 0
    fi
    
    # Clear application cache
    print_status "Clearing application cache..."
    # Add cache clearing commands here
    
    # Send deployment notification
    if [[ "$ENVIRONMENT" == "production" ]]; then
        send_deployment_notification
    fi
    
    print_success "Post-deployment tasks completed"
}

# Function to send deployment notification
send_deployment_notification() {
    print_status "Sending deployment notification..."
    
    # Add notification logic here (Slack, email, etc.)
    # Example:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"Barangay app deployed to production successfully!"}' \
    #   "$SLACK_WEBHOOK_URL"
}

# Function to rollback deployment
rollback_deployment() {
    print_error "Deployment failed. Rolling back..."
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would rollback deployment"
        return 0
    fi
    
    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    cd "$PROJECT_ROOT"
    
    # Stop current containers
    docker-compose -f "$compose_file" down
    
    # Restore from backup if available
    local restore_script="$DEPLOYMENT_DIR/scripts/restore.sh"
    if [[ -f "$restore_script" ]]; then
        bash "$restore_script" "$ENVIRONMENT"
    fi
    
    print_error "Rollback completed. Please check the logs and fix the issues."
}

# Main deployment function
main() {
    print_status "Starting deployment to $ENVIRONMENT environment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        print_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Trap errors and rollback
    trap 'rollback_deployment' ERR
    
    check_prerequisites
    run_tests
    backup_database
    build_images
    deploy_application
    post_deployment_tasks
    
    print_success "Deployment to $ENVIRONMENT completed successfully!"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_status "Production URL: https://dampol2nda.gov.ph"
        print_status "Admin Dashboard: https://dashboard.dampol2nda.gov.ph"
        print_status "Monitoring: https://monitoring.dampol2nda.gov.ph"
    else
        print_status "Staging URL: https://staging.dampol2nda.gov.ph"
    fi
}

# Run main function
main "$@"
