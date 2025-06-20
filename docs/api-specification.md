# Barangay Hall Web Application - API Specification

## Overview

RESTful API specification for the Barangay Hall Web Application, designed with security, compliance, and accessibility in mind.

**Base URL:** `https://api.barangay-app.gov.ph/v1`
**Authentication:** JWT Bearer Token
**Content-Type:** `application/json`

## Authentication

### POST /auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST /auth/register
Register new resident account
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "phone": "+639123456789"
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
