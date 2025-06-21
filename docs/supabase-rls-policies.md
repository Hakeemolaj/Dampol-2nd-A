# Supabase Row Level Security (RLS) Policies

This document outlines the Row Level Security policies for the Barangay Web Application to ensure secure multi-user access.

## Overview

Row Level Security (RLS) is a PostgreSQL feature that allows you to control access to rows in a table based on the characteristics of the user executing a query. In our Barangay application, RLS ensures that:

- Users can only access their own data
- Residents can only see their own records
- Public announcements are visible to all authenticated users
- Administrative data is protected

## Prerequisites

Before implementing these policies, ensure that:
1. Your Supabase project is set up
2. The database schema has been created
3. Authentication is properly configured

## Enable RLS on Tables

First, enable RLS on all sensitive tables:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

## User Profiles Policies

Users should only be able to access and modify their own profile:

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Residents Policies

Residents can access their own resident records:

```sql
-- Users can view their own resident record
CREATE POLICY "Users can view own resident record" ON residents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own resident record
CREATE POLICY "Users can update own resident record" ON residents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can create their own resident record
CREATE POLICY "Users can create own resident record" ON residents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin users can view all resident records
CREATE POLICY "Admin can view all residents" ON residents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Admin users can update all resident records
CREATE POLICY "Admin can update all residents" ON residents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
```

## Households Policies

Household members can view their household information:

```sql
-- Users can view their own household
CREATE POLICY "Users can view own household" ON households
  FOR SELECT USING (
    auth.uid() = head_of_family OR
    EXISTS (
      SELECT 1 FROM residents 
      WHERE household_id = households.id 
      AND user_id = auth.uid()
    )
  );

-- Only household head can update household info
CREATE POLICY "Household head can update household" ON households
  FOR UPDATE USING (auth.uid() = head_of_family);

-- Admin users can view all households
CREATE POLICY "Admin can view all households" ON households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
```

## Announcements Policies

Public announcements should be visible to all authenticated users:

```sql
-- Anyone can view published announcements
CREATE POLICY "Anyone can view published announcements" ON announcements
  FOR SELECT USING (is_published = true);

-- Only admin/staff can create announcements
CREATE POLICY "Admin can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Only admin/staff can update announcements
CREATE POLICY "Admin can update announcements" ON announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Authors can update their own announcements
CREATE POLICY "Authors can update own announcements" ON announcements
  FOR UPDATE USING (auth.uid() = author_id);

-- Only admin/staff can delete announcements
CREATE POLICY "Admin can delete announcements" ON announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
```

## Document Requests Policies

Users should only access their own document requests:

```sql
-- Users can view their own document requests
CREATE POLICY "Users can view own document requests" ON document_requests
  FOR SELECT USING (auth.uid() = applicant_id);

-- Users can create document requests
CREATE POLICY "Users can create document requests" ON document_requests
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests" ON document_requests
  FOR UPDATE USING (
    auth.uid() = applicant_id AND 
    status IN ('pending', 'draft')
  );

-- Admin/staff can view all document requests
CREATE POLICY "Admin can view all document requests" ON document_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Admin/staff can update all document requests
CREATE POLICY "Admin can update all document requests" ON document_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
```

## Document Types Policies

Document types are public information:

```sql
-- Anyone can view active document types
CREATE POLICY "Anyone can view active document types" ON document_types
  FOR SELECT USING (is_active = true);

-- Only admin can manage document types
CREATE POLICY "Admin can manage document types" ON document_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

## Incident Reports Policies

Users can only access their own incident reports:

```sql
-- Users can view their own incident reports
CREATE POLICY "Users can view own incident reports" ON incident_reports
  FOR SELECT USING (auth.uid() = complainant_id);

-- Users can create incident reports
CREATE POLICY "Users can create incident reports" ON incident_reports
  FOR INSERT WITH CHECK (auth.uid() = complainant_id);

-- Admin/staff can view all incident reports
CREATE POLICY "Admin can view all incident reports" ON incident_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Admin/staff can update all incident reports
CREATE POLICY "Admin can update all incident reports" ON incident_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );
```

## Audit Logs Policies

Audit logs should only be accessible to administrators:

```sql
-- Only admin can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
```

## Helper Functions

Create helper functions for common role checks:

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing RLS Policies

After implementing the policies, test them by:

1. Creating test users with different roles
2. Attempting to access data that should be restricted
3. Verifying that users can only see their own data
4. Testing admin access to all data

## Security Best Practices

1. **Principle of Least Privilege**: Grant only the minimum access required
2. **Regular Audits**: Periodically review and update policies
3. **Test Thoroughly**: Test all policies with different user scenarios
4. **Monitor Access**: Use audit logs to monitor data access patterns
5. **Keep Policies Simple**: Complex policies are harder to maintain and debug

## Troubleshooting

Common issues and solutions:

1. **Policy not working**: Check if RLS is enabled on the table
2. **Access denied**: Verify the user has the correct role in user_profiles
3. **Performance issues**: Consider indexing columns used in policies
4. **Complex queries failing**: Break down complex policies into simpler ones

## Maintenance

- Review policies quarterly
- Update policies when adding new features
- Document any policy changes
- Test policies after schema changes
