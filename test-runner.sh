#!/bin/bash

# Comprehensive Test Runner for Barangay Web Application
# This script runs all tests for both frontend and backend

set -e  # Exit on any error

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

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        print_error "Directory $1 does not exist"
        exit 1
    fi
}

# Function to run tests with error handling
run_tests() {
    local test_type="$1"
    local directory="$2"
    local command="$3"
    
    print_status "Running $test_type tests in $directory..."
    
    cd "$directory"
    
    if eval "$command"; then
        print_success "$test_type tests passed"
    else
        print_error "$test_type tests failed"
        return 1
    fi
    
    cd - > /dev/null
}

# Main execution
main() {
    print_status "Starting comprehensive test suite for Barangay Web Application"
    
    # Check if we're in the right directory
    if [ ! -f "test-runner.sh" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check required directories
    check_directory "backend"
    check_directory "frontend"
    
    # Initialize test results
    backend_tests_passed=false
    frontend_tests_passed=false
    
    # Parse command line arguments
    run_backend=true
    run_frontend=true
    run_coverage=false
    run_integration=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                run_frontend=false
                shift
                ;;
            --frontend-only)
                run_backend=false
                shift
                ;;
            --coverage)
                run_coverage=true
                shift
                ;;
            --integration)
                run_integration=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --backend-only    Run only backend tests"
                echo "  --frontend-only   Run only frontend tests"
                echo "  --coverage        Run tests with coverage reports"
                echo "  --integration     Run integration tests"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Backend Tests
    if [ "$run_backend" = true ]; then
        print_status "=== BACKEND TESTS ==="
        
        # Check if node_modules exists
        if [ ! -d "backend/node_modules" ]; then
            print_warning "Backend dependencies not installed. Installing..."
            cd backend && npm install && cd ..
        fi
        
        # Unit Tests
        if [ "$run_coverage" = true ]; then
            if run_tests "Backend Unit (with coverage)" "backend" "npm run test:coverage"; then
                backend_tests_passed=true
            fi
        else
            if run_tests "Backend Unit" "backend" "npm test"; then
                backend_tests_passed=true
            fi
        fi
        
        # Security Tests
        if [ "$backend_tests_passed" = true ]; then
            run_tests "Backend Security" "backend" "npm run test:security" || print_warning "Security tests failed"
        fi
        
        # Performance Tests
        if [ "$backend_tests_passed" = true ]; then
            run_tests "Backend Performance" "backend" "npm run test:performance" || print_warning "Performance tests failed"
        fi
        
        # Document Tests
        if [ "$backend_tests_passed" = true ]; then
            run_tests "Backend Document" "backend" "npm run test:documents" || print_warning "Document tests failed"
        fi
    fi
    
    # Frontend Tests
    if [ "$run_frontend" = true ]; then
        print_status "=== FRONTEND TESTS ==="
        
        # Check if node_modules exists
        if [ ! -d "frontend/node_modules" ]; then
            print_warning "Frontend dependencies not installed. Installing..."
            cd frontend && npm install && cd ..
        fi
        
        # Unit Tests
        if [ "$run_coverage" = true ]; then
            if run_tests "Frontend Unit (with coverage)" "frontend" "npm run test:coverage"; then
                frontend_tests_passed=true
            fi
        else
            if run_tests "Frontend Unit" "frontend" "npm test -- --watchAll=false"; then
                frontend_tests_passed=true
            fi
        fi
        
        # Component Tests
        if [ "$frontend_tests_passed" = true ]; then
            run_tests "Frontend Components" "frontend" "npm run test:components -- --watchAll=false" || print_warning "Component tests failed"
        fi
    fi
    
    # Integration Tests
    if [ "$run_integration" = true ]; then
        print_status "=== INTEGRATION TESTS ==="
        
        if [ "$backend_tests_passed" = true ] && [ "$frontend_tests_passed" = true ]; then
            run_tests "Backend Integration" "backend" "npm test -- --testPathPattern=integration" || print_warning "Backend integration tests failed"
            run_tests "Frontend Integration" "frontend" "npm run test:integration -- --watchAll=false" || print_warning "Frontend integration tests failed"
        else
            print_warning "Skipping integration tests due to unit test failures"
        fi
    fi
    
    # Type Checking
    print_status "=== TYPE CHECKING ==="
    
    if [ "$run_backend" = true ]; then
        run_tests "Backend TypeScript" "backend" "npm run type-check" || print_warning "Backend type checking failed"
    fi
    
    if [ "$run_frontend" = true ]; then
        run_tests "Frontend TypeScript" "frontend" "npx tsc --noEmit" || print_warning "Frontend type checking failed"
    fi
    
    # Linting
    print_status "=== LINTING ==="
    
    if [ "$run_frontend" = true ]; then
        run_tests "Frontend Linting" "frontend" "npm run lint" || print_warning "Frontend linting failed"
    fi
    
    # Summary
    print_status "=== TEST SUMMARY ==="
    
    if [ "$run_backend" = true ]; then
        if [ "$backend_tests_passed" = true ]; then
            print_success "Backend tests: PASSED"
        else
            print_error "Backend tests: FAILED"
        fi
    fi
    
    if [ "$run_frontend" = true ]; then
        if [ "$frontend_tests_passed" = true ]; then
            print_success "Frontend tests: PASSED"
        else
            print_error "Frontend tests: FAILED"
        fi
    fi
    
    # Overall result
    overall_success=true
    
    if [ "$run_backend" = true ] && [ "$backend_tests_passed" = false ]; then
        overall_success=false
    fi
    
    if [ "$run_frontend" = true ] && [ "$frontend_tests_passed" = false ]; then
        overall_success=false
    fi
    
    if [ "$overall_success" = true ]; then
        print_success "All tests completed successfully!"
        exit 0
    else
        print_error "Some tests failed. Please check the output above."
        exit 1
    fi
}

# Run main function
main "$@"
