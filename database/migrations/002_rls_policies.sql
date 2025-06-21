-- Row Level Security Policies for Barangay Web Application
-- This migration sets up RLS policies for secure multi-user access

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

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

-- =============================================
-- USER PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles" ON user_profiles
  FOR UPDATE USING (is_admin());

-- =============================================
-- RESIDENTS POLICIES
-- =============================================

-- Users can view their own resident record
CREATE POLICY "Users can view own resident record" ON residents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own resident record
CREATE POLICY "Users can update own resident record" ON residents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can create their own resident record
CREATE POLICY "Users can create own resident record" ON residents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff/Admin can view all resident records
CREATE POLICY "Staff can view all residents" ON residents
  FOR SELECT USING (is_staff_or_admin());

-- Staff/Admin can update all resident records
CREATE POLICY "Staff can update all residents" ON residents
  FOR UPDATE USING (is_staff_or_admin());

-- Staff/Admin can create resident records
CREATE POLICY "Staff can create residents" ON residents
  FOR INSERT WITH CHECK (is_staff_or_admin());

-- =============================================
-- HOUSEHOLDS POLICIES
-- =============================================

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

-- Staff/Admin can view all households
CREATE POLICY "Staff can view all households" ON households
  FOR SELECT USING (is_staff_or_admin());

-- Staff/Admin can manage households
CREATE POLICY "Staff can manage households" ON households
  FOR ALL USING (is_staff_or_admin());

-- =============================================
-- ANNOUNCEMENTS POLICIES
-- =============================================

-- Anyone can view published announcements
CREATE POLICY "Anyone can view published announcements" ON announcements
  FOR SELECT USING (is_published = true);

-- Staff/Admin can view all announcements
CREATE POLICY "Staff can view all announcements" ON announcements
  FOR SELECT USING (is_staff_or_admin());

-- Staff/Admin can create announcements
CREATE POLICY "Staff can create announcements" ON announcements
  FOR INSERT WITH CHECK (is_staff_or_admin());

-- Staff/Admin can update announcements
CREATE POLICY "Staff can update announcements" ON announcements
  FOR UPDATE USING (is_staff_or_admin());

-- Authors can update their own announcements
CREATE POLICY "Authors can update own announcements" ON announcements
  FOR UPDATE USING (auth.uid() = author_id);

-- Staff/Admin can delete announcements
CREATE POLICY "Staff can delete announcements" ON announcements
  FOR DELETE USING (is_staff_or_admin());

-- =============================================
-- DOCUMENT TYPES POLICIES
-- =============================================

-- Anyone can view active document types
CREATE POLICY "Anyone can view active document types" ON document_types
  FOR SELECT USING (is_active = true);

-- Staff can view all document types
CREATE POLICY "Staff can view all document types" ON document_types
  FOR SELECT USING (is_staff_or_admin());

-- Only admin can manage document types
CREATE POLICY "Admin can manage document types" ON document_types
  FOR ALL USING (is_admin());

-- =============================================
-- DOCUMENT REQUESTS POLICIES
-- =============================================

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

-- Staff/Admin can view all document requests
CREATE POLICY "Staff can view all document requests" ON document_requests
  FOR SELECT USING (is_staff_or_admin());

-- Staff/Admin can update all document requests
CREATE POLICY "Staff can update all document requests" ON document_requests
  FOR UPDATE USING (is_staff_or_admin());

-- Staff/Admin can create document requests (on behalf of residents)
CREATE POLICY "Staff can create document requests" ON document_requests
  FOR INSERT WITH CHECK (is_staff_or_admin());

-- =============================================
-- INCIDENT REPORTS POLICIES
-- =============================================

-- Users can view their own incident reports
CREATE POLICY "Users can view own incident reports" ON incident_reports
  FOR SELECT USING (auth.uid() = complainant_id);

-- Users can create incident reports
CREATE POLICY "Users can create incident reports" ON incident_reports
  FOR INSERT WITH CHECK (auth.uid() = complainant_id);

-- Staff/Admin can view all incident reports
CREATE POLICY "Staff can view all incident reports" ON incident_reports
  FOR SELECT USING (is_staff_or_admin());

-- Staff/Admin can update all incident reports
CREATE POLICY "Staff can update all incident reports" ON incident_reports
  FOR UPDATE USING (is_staff_or_admin());

-- Staff/Admin can create incident reports
CREATE POLICY "Staff can create incident reports" ON incident_reports
  FOR INSERT WITH CHECK (is_staff_or_admin());

-- =============================================
-- AUDIT LOGS POLICIES
-- =============================================

-- Only admin can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- No updates or deletes allowed on audit logs
-- (This is enforced by not creating policies for UPDATE/DELETE)
