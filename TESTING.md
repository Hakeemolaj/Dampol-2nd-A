# Testing Guide for Barangay Web Application

This document provides comprehensive information about testing the Barangay Web Application, including unit tests, integration tests, and end-to-end tests for both frontend and backend components.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Backend Testing](#backend-testing)
5. [Frontend Testing](#frontend-testing)
6. [Integration Testing](#integration-testing)
7. [Test Coverage](#test-coverage)
8. [Continuous Integration](#continuous-integration)
9. [Writing New Tests](#writing-new-tests)

## Overview

The testing strategy includes:

- **Unit Tests**: Test individual components, services, and functions
- **Integration Tests**: Test API endpoints and component interactions
- **End-to-End Tests**: Test complete user workflows
- **Security Tests**: Test authentication, authorization, and data validation
- **Performance Tests**: Test API response times and load handling

## Test Structure

```
project-root/
├── backend/
│   ├── src/tests/
│   │   ├── controllers/          # Controller unit tests
│   │   ├── services/            # Service unit tests
│   │   ├── integration/         # API integration tests
│   │   └── setup/              # Test configuration and mocks
│   ├── tests/                  # Legacy test files
│   └── jest.config.js          # Jest configuration
├── frontend/
│   ├── src/tests/
│   │   ├── components/         # Component unit tests
│   │   ├── integration/        # Frontend integration tests
│   │   └── e2e/               # End-to-end tests
│   ├── __tests__/             # Additional test files
│   ├── jest.config.js         # Jest configuration
│   └── jest.setup.js          # Test setup and mocks
└── test-runner.sh             # Comprehensive test runner
```

## Running Tests

### Quick Start

Run all tests:
```bash
./test-runner.sh
```

Run with coverage:
```bash
./test-runner.sh --coverage
```

Run only backend tests:
```bash
./test-runner.sh --backend-only
```

Run only frontend tests:
```bash
./test-runner.sh --frontend-only
```

Run integration tests:
```bash
./test-runner.sh --integration
```

### Individual Test Commands

**Backend:**
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:security      # Run security tests
npm run test:performance   # Run performance tests
npm run test:documents     # Run document-specific tests
```

**Frontend:**
```bash
cd frontend
npm test                   # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:components   # Run component tests only
npm run test:integration  # Run integration tests
```

## Backend Testing

### Test Categories

1. **Controller Tests** (`src/tests/controllers/`)
   - Authentication controller tests
   - API endpoint validation
   - Request/response handling

2. **Service Tests** (`src/tests/services/`)
   - Database service tests
   - Business logic validation
   - External service integration

3. **Integration Tests** (`src/tests/integration/`)
   - Full API workflow tests
   - Database integration
   - Authentication flows

### Example Test Structure

```typescript
// src/tests/services/announcements.service.test.ts
describe('AnnouncementsService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated announcements', async () => {
      // Test implementation
    });
  });
});
```

### Mocking

Backend tests use comprehensive mocking for:
- Supabase client
- Database operations
- External APIs
- Authentication

## Frontend Testing

### Test Categories

1. **Component Tests** (`src/tests/components/`)
   - React component rendering
   - User interaction testing
   - Props validation

2. **Integration Tests** (`src/tests/integration/`)
   - API integration
   - State management
   - Navigation flows

3. **End-to-End Tests** (`src/tests/e2e/`)
   - Complete user workflows
   - Cross-browser testing
   - Performance testing

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests
- **Playwright**: End-to-end testing (planned)

### Example Component Test

```typescript
// src/tests/components/AnnouncementsSection.test.tsx
describe('AnnouncementsSection', () => {
  it('displays announcements after loading', async () => {
    global.testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Community Meeting')).toBeInTheDocument();
    });
  });
});
```

## Integration Testing

Integration tests verify:
- API endpoint functionality
- Database operations
- Authentication flows
- Cross-component communication

### API Integration Tests

```typescript
describe('API Integration Tests', () => {
  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
    });
  });
});
```

## Test Coverage

### Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 75% code coverage
- **Critical paths**: 95% coverage for authentication, payments, data validation

### Coverage Reports

Coverage reports are generated in:
- `backend/coverage/` - Backend coverage reports
- `frontend/coverage/` - Frontend coverage reports

View coverage reports:
```bash
# Backend
cd backend && npm run test:coverage && open coverage/lcov-report/index.html

# Frontend
cd frontend && npm run test:coverage && open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions (Planned)

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      - name: Run tests
        run: ./test-runner.sh --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## Writing New Tests

### Best Practices

1. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Descriptive Names**: Use clear, descriptive test names
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Coverage**: Aim for high coverage of critical paths

### Test Templates

**Backend Service Test:**
```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    resetAllMocks();
    service = new ServiceName(mockClient);
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      setupMockDatabaseSuccess(mockData);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle error case', async () => {
      // Arrange
      setupMockDatabaseError('Error message');

      // Act & Assert
      await expect(service.methodName(input)).rejects.toThrow('Expected error');
    });
  });
});
```

**Frontend Component Test:**
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    global.testUtils.resetAllMocks();
  });

  it('should render correctly', () => {
    // Arrange
    const props = { /* test props */ };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    // Arrange
    render(<ComponentName />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() => {
      expect(/* expected behavior */).toBeTruthy();
    });
  });
});
```

### Adding New Test Files

1. Create test file with `.test.ts` or `.test.tsx` extension
2. Place in appropriate directory structure
3. Import necessary testing utilities
4. Follow existing patterns and conventions
5. Update this documentation if adding new test categories

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are reset between tests
2. **Async test failures**: Use proper async/await and waitFor
3. **Environment variables**: Check test environment setup
4. **Database connections**: Ensure proper mocking of database calls

### Debug Mode

Run tests in debug mode:
```bash
# Backend
cd backend && npm test -- --verbose

# Frontend
cd frontend && npm test -- --verbose --watchAll=false
```

For more detailed debugging, check the test setup files and mock configurations.
