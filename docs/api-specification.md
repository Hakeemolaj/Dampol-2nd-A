# Barangay Hall Web Application - API Specification

## Overview

RESTful API specification for the Barangay Hall Web Application, designed with security, compliance, and accessibility in mind. The API is built with Node.js/Express and uses Supabase for database and authentication.

**Base URL:** `http://localhost:3002/api/v1` (Development)
**Production URL:** `https://api.barangay-app.gov.ph/v1`
**Authentication:** JWT Bearer Token (Supabase Auth)
**Content-Type:** `application/json`
**Database:** Supabase (PostgreSQL with Row Level Security)

## Authentication

The API uses Supabase Authentication with JWT tokens. All protected endpoints require a valid Bearer token in the Authorization header.

### Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Include token** in subsequent requests: `Authorization: Bearer <token>`
3. **Token validation** happens automatically via Supabase
4. **Row Level Security** ensures users only access authorized data

### POST /auth/register
Register new resident account with Supabase Auth

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "middleName": "Santos",
  "phone": "+639123456789"
}
```

**Response (201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "role": "resident"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

### POST /auth/login
Login with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "role": "resident"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

### POST /auth/logout
Logout current user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### GET /auth/profile
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "middle_name": "Santos",
      "phone": "+639123456789",
      "role": "resident",
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

### PUT /auth/profile
Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "first_name": "Juan Carlos",
  "phone": "+639987654321",
  "address": "123 Main St, Dampol 2nd A"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Juan Carlos",
      "phone": "+639987654321",
      "address": "123 Main St, Dampol 2nd A",
      "updated_at": "2025-01-01T12:00:00Z"
    }
  }
}
```

## Announcements

Public announcements and community notices. Published announcements are visible to all users.

### GET /announcements
Get published announcements with pagination and filtering

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority (low, normal, high, urgent)
- `search` (optional): Search in title and content

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "announcements": [
      {
        "id": "uuid",
        "title": "Barangay Assembly - January 15, 2025",
        "summary": "Monthly barangay assembly for residents",
        "content": "Join us for our monthly community meeting...",
        "category": "Meeting",
        "priority": "normal",
        "is_published": true,
        "published_at": "2025-01-10T08:00:00Z",
        "expires_at": "2025-01-15T23:59:59Z",
        "author_id": "uuid",
        "created_at": "2025-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /announcements/urgent
Get urgent announcements

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "announcements": [
      {
        "id": "uuid",
        "title": "Road Improvement Project - Dampol Road",
        "summary": "Road concreting project ongoing",
        "priority": "urgent",
        "published_at": "2025-01-08T06:00:00Z"
      }
    ]
  }
}
```

### GET /announcements/categories
Get available announcement categories

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "categories": [
      "Meeting",
      "Health",
      "Infrastructure",
      "Environment",
      "Event",
      "Safety"
    ]
  }
}
```

### GET /announcements/:id
Get specific announcement by ID

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "announcement": {
      "id": "uuid",
      "title": "Barangay Assembly - January 15, 2025",
      "summary": "Monthly barangay assembly for residents",
      "content": "Join us for our monthly community meeting...",
      "category": "Meeting",
      "priority": "normal",
      "is_published": true,
      "published_at": "2025-01-10T08:00:00Z",
      "expires_at": "2025-01-15T23:59:59Z",
      "created_at": "2025-01-10T08:00:00Z"
    }
  }
}
```

## Residents

Resident management and registration. Requires authentication.

### GET /residents
Get residents list (Admin/Staff only)

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin, staff

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by resident ID or name
- `status` (optional): Filter by status (Active, Inactive, Deceased, Moved)
- `household_id` (optional): Filter by household

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "residents": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "resident_id": "RES-000001",
        "household_id": "uuid",
        "relationship_to_head": "Head",
        "is_registered_voter": true,
        "voter_id": "1234567890",
        "is_pwd": false,
        "is_senior_citizen": false,
        "is_4ps_beneficiary": false,
        "status": "Active",
        "user_profile": {
          "first_name": "Juan",
          "last_name": "Dela Cruz",
          "phone": "+639123456789"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /residents
Register as resident

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "resident_id": "RES-000002",
  "household_id": "uuid",
  "relationship_to_head": "Spouse",
  "is_registered_voter": true,
  "voter_id": "0987654321",
  "is_pwd": false,
  "is_senior_citizen": false,
  "is_4ps_beneficiary": true,
  "emergency_contact_name": "Maria Dela Cruz",
  "emergency_contact_phone": "+639987654321"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "resident": {
      "id": "uuid",
      "user_id": "uuid",
      "resident_id": "RES-000002",
      "household_id": "uuid",
      "relationship_to_head": "Spouse",
      "status": "Active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

### GET /residents/profile
Get own resident profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "resident": {
      "id": "uuid",
      "user_id": "uuid",
      "resident_id": "RES-000001",
      "household_id": "uuid",
      "relationship_to_head": "Head",
      "is_registered_voter": true,
      "status": "Active",
      "user_profile": {
        "first_name": "Juan",
        "last_name": "Dela Cruz",
        "phone": "+639123456789",
        "address": "123 Main St, Dampol 2nd A"
      }
    }
  }
}
```

### POST /auth/logout
Logout and invalidate token

### POST /auth/refresh
Refresh JWT token

## User Management

### GET /users/profile
Get current user profile
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "phone": "+639123456789",
  "role": "resident",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PUT /users/profile
Update user profile
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "phone": "+639123456789",
  "address": "123 Main St, Barangay Sample"
}
```

### GET /users/data-export
Export all user data (Data Privacy Act compliance)

### DELETE /users/account
Delete user account and all associated data

## Resident Management

### GET /residents
List all residents (Admin only)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or resident ID
- `status`: Filter by status (Active, Inactive, etc.)

### GET /residents/:id
Get specific resident details

### POST /residents
Register new resident
```json
{
  "user_id": "uuid",
  "household_id": "uuid",
  "relationship_to_head": "Son",
  "is_registered_voter": true,
  "voter_id": "1234567890"
}
```

### PUT /residents/:id
Update resident information

### GET /residents/households
List households with members

## Document Services

### GET /documents/types
List available document types
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Barangay Clearance",
    "description": "Certificate of good moral character",
    "fee": 50.00,
    "processing_time_days": 1,
    "requirements": ["Valid ID", "Proof of Residency"]
  }
]
```

### POST /documents/requests
Submit document request
```json
{
  "document_type_id": "uuid",
  "purpose": "Employment requirement",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

### GET /documents/requests
List user's document requests
**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by document type

### GET /documents/requests/:id
Get specific document request details

### PUT /documents/requests/:id/status
Update document request status (Staff only)
```json
{
  "status": "Ready",
  "notes": "Document ready for pickup"
}
```

### POST /documents/upload
Upload document attachments
**Content-Type:** `multipart/form-data`

## Public Information

### GET /announcements
List public announcements
**Query Parameters:**
- `category`: Filter by category
- `limit`: Number of items

### GET /announcements/:id
Get specific announcement

### POST /announcements
Create announcement (Admin only)
```json
{
  "title": "Community Meeting",
  "content": "Monthly barangay assembly...",
  "category": "Meeting",
  "priority": "Normal"
}
```

### GET /events
List upcoming events

### GET /officials
List current barangay officials
**Response:**
```json
[
  {
    "name": "Juan Dela Cruz",
    "position": "Barangay Captain",
    "committee": "Executive",
    "term_start": "2023-01-01",
    "term_end": "2025-12-31"
  }
]
```

## Administrative Functions

### GET /admin/dashboard
Get dashboard statistics (Admin only)
**Response:**
```json
{
  "total_residents": 1500,
  "pending_documents": 25,
  "recent_registrations": 5,
  "revenue_this_month": 15000.00
}
```

### GET /admin/residents/statistics
Get resident demographics and statistics

### POST /admin/bulk-import
Bulk import resident data (CSV)

## Case Management

### GET /cases
List incident reports/blotter entries
**Query Parameters:**
- `status`: Filter by case status
- `type`: Filter by incident type
- `date_from`, `date_to`: Date range filter

### POST /cases
Create new incident report
```json
{
  "incident_type": "Noise Complaint",
  "complainant_id": "uuid",
  "respondent_name": "John Doe",
  "incident_date": "2024-01-01T14:00:00Z",
  "description": "Loud music during prohibited hours",
  "location": "123 Sample Street"
}
```

### PUT /cases/:id
Update case status and resolution

## Financial Management

### GET /finance/budget
Get budget allocation and utilization

### GET /finance/revenue
Get revenue records
**Query Parameters:**
- `year`: Filter by fiscal year
- `month`: Filter by month
- `source`: Filter by revenue source

### POST /finance/revenue
Record new revenue entry
```json
{
  "source": "Document Fees",
  "amount": 500.00,
  "payer_name": "Juan Dela Cruz",
  "receipt_number": "OR-2024-001"
}
```

## Compliance & Audit

### GET /audit/logs
Get audit trail (Admin only)
**Query Parameters:**
- `user_id`: Filter by user
- `action`: Filter by action type
- `table_name`: Filter by affected table
- `date_from`, `date_to`: Date range

### POST /privacy/consent
Record user consent
```json
{
  "purpose": "Document Processing",
  "consent_text": "I agree to the processing of my personal data...",
  "is_granted": true
}
```

### GET /privacy/consent
Get user's consent history

### POST /foi/requests
Submit Freedom of Information request
```json
{
  "requester_name": "Maria Santos",
  "requester_email": "maria@example.com",
  "information_requested": "Budget allocation for 2024",
  "purpose": "Research"
}
```

### GET /foi/requests
List FOI requests (Admin only)

## Reports & Analytics

### GET /reports/residents
Generate resident reports
**Query Parameters:**
- `format`: pdf, csv, excel
- `type`: demographics, statistics, list

### GET /reports/documents
Generate document processing reports

### GET /reports/financial
Generate financial reports

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Public endpoints:** 100 requests per hour per IP
- **Authenticated endpoints:** 1000 requests per hour per user
- **Admin endpoints:** 5000 requests per hour per admin

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Data Privacy Compliance

### Data Subject Rights Implementation

**GET /privacy/data-export**
Export all user data in machine-readable format

**POST /privacy/data-correction**
Request correction of personal data

**DELETE /privacy/data-deletion**
Request deletion of personal data

**GET /privacy/processing-activities**
View how personal data is being processed

## Accessibility Features

### API Response Format
All responses include accessibility metadata:
```json
{
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "accessibility": {
      "screen_reader_summary": "List of 20 residents out of 100 total",
      "keyboard_navigation": true
    }
  }
}
```

## Versioning

API versioning through URL path: `/v1/`, `/v2/`, etc.
Backward compatibility maintained for at least 2 major versions.

## Documentation

- **OpenAPI 3.0 specification** available at `/docs`
- **Interactive API explorer** at `/docs/explorer`
- **Postman collection** available for download

---

*API Version: 1.0*
*Last Updated: December 19, 2024*
*Compliance: Data Privacy Act, FOI Act, ARTA, WCAG 2.0*
