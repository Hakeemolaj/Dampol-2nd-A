#!/bin/bash

# Barangay Web Application - Development Setup Script
# This script sets up the complete development environment

set -e

echo "🏛️  Setting up Barangay Web Application Development Environment"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found: $(docker --version)"
    else
        print_warning "Docker not found. You can still run the application without Docker."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied!"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy environment template if .env doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please update .env file with your actual configuration values"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Create frontend .env.local if it doesn't exist
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Barangay Web Application"
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
        print_success "Created frontend/.env.local"
    fi
    
    # Create backend .env if it doesn't exist
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://barangay_user:barangay_password@localhost:5432/barangay_db
JWT_SECRET=development-jwt-secret-change-in-production
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
        print_success "Created backend/.env"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
    
    # Install backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    print_success "All dependencies installed!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if Docker is available and running
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        print_status "Starting database with Docker..."
        docker-compose up -d postgres
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run database migrations
        if [ -f "database/schemas/database-schema-design.sql" ]; then
            print_status "Running database schema..."
            docker-compose exec -T postgres psql -U barangay_user -d barangay_db < database/schemas/database-schema-design.sql
            print_success "Database schema applied"
        fi
    else
        print_warning "Docker not available. Please set up PostgreSQL manually:"
        print_warning "1. Install PostgreSQL 15+"
        print_warning "2. Create database 'barangay_db'"
        print_warning "3. Create user 'barangay_user' with password 'barangay_password'"
        print_warning "4. Run the SQL schema from database/schemas/database-schema-design.sql"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create upload directories
    mkdir -p uploads/documents
    mkdir -p uploads/images
    mkdir -p uploads/temp
    
    # Create log directories
    mkdir -p logs
    
    # Create backup directories
    mkdir -p database/backups/daily
    mkdir -p database/backups/weekly
    mkdir -p database/backups/monthly
    
    print_success "Directories created"
}

# Setup Git hooks (if in a Git repository)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Setting up Git hooks..."
        
        # Install husky if package.json exists
        if [ -f "package.json" ]; then
            npx husky install
            print_success "Git hooks configured"
        fi
    else
        print_warning "Not in a Git repository, skipping Git hooks setup"
    fi
}

# Main setup function
main() {
    echo
    print_status "Starting development environment setup..."
    echo
    
    check_prerequisites
    echo
    
    setup_environment
    echo
    
    create_directories
    echo
    
    install_dependencies
    echo
    
    setup_database
    echo
    
    setup_git_hooks
    echo
    
    print_success "🎉 Development environment setup complete!"
    echo
    print_status "Next steps:"
    echo "1. Update .env files with your actual configuration"
    echo "2. Start the development servers:"
    echo "   - npm run dev (starts both frontend and backend)"
    echo "   - Or use Docker: docker-compose up"
    echo "3. Open http://localhost:3000 in your browser"
    echo
    print_status "Useful commands:"
    echo "- npm run dev:frontend  # Start only frontend"
    echo "- npm run dev:backend   # Start only backend"
    echo "- npm test              # Run all tests"
    echo "- npm run lint          # Check code quality"
    echo
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
