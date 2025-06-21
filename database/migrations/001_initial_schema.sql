-- Initial Database Schema for Barangay Web Application
-- This migration creates all the necessary tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================
-- USER PROFILES (extends Supabase auth.users)
-- =============================================

CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    civil_status VARCHAR(20) CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced')),
    occupation VARCHAR(100),
    address TEXT,
    role VARCHAR(30) DEFAULT 'resident' CHECK (role IN ('admin', 'barangay_captain', 'barangay_secretary', 'barangay_treasurer', 'barangay_councilor', 'sk_chairman', 'staff', 'resident')),
    position VARCHAR(50),
    department VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- HOUSEHOLDS
-- =============================================

CREATE TABLE households (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    household_number VARCHAR(20) UNIQUE NOT NULL,
    head_of_family UUID REFERENCES auth.users(id),
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    purok VARCHAR(50),
    coordinates POINT,
    household_type VARCHAR(20) CHECK (household_type IN ('Nuclear', 'Extended', 'Single')),
    monthly_income DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENTS
-- =============================================

CREATE TABLE residents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    resident_id VARCHAR(20) UNIQUE NOT NULL,
    household_id UUID REFERENCES households(id),
    relationship_to_head VARCHAR(50),
    is_registered_voter BOOLEAN DEFAULT FALSE,
    voter_id VARCHAR(20),
    is_pwd BOOLEAN DEFAULT FALSE,
    pwd_id VARCHAR(20),
    is_senior_citizen BOOLEAN DEFAULT FALSE,
    is_4ps_beneficiary BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deceased', 'Moved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT TYPES
-- =============================================

CREATE TABLE document_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fee_amount DECIMAL(10,2),
    processing_days INTEGER DEFAULT 3,
    requirements JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT REQUESTS
-- =============================================

CREATE TABLE document_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    document_type_id UUID REFERENCES document_types(id) NOT NULL,
    applicant_id UUID REFERENCES auth.users(id) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'released', 'cancelled')),
    fee_amount DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'waived')),
    payment_reference VARCHAR(50),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INCIDENT REPORTS (Blotter)
-- =============================================

CREATE TABLE incident_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blotter_number VARCHAR(20) UNIQUE NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    complainant_id UUID REFERENCES auth.users(id),
    respondent_name VARCHAR(200),
    respondent_address TEXT,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_location VARCHAR(200),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'Mediation', 'Resolved', 'Referred', 'Closed')),
    investigating_officer UUID REFERENCES auth.users(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Households indexes
CREATE INDEX idx_households_head_of_family ON households(head_of_family);
CREATE INDEX idx_households_purok ON households(purok);

-- Residents indexes
CREATE INDEX idx_residents_user_id ON residents(user_id);
CREATE INDEX idx_residents_household_id ON residents(household_id);
CREATE INDEX idx_residents_status ON residents(status);
CREATE INDEX idx_residents_voter ON residents(is_registered_voter);

-- Announcements indexes
CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_author ON announcements(author_id);

-- Document requests indexes
CREATE INDEX idx_document_requests_applicant ON document_requests(applicant_id);
CREATE INDEX idx_document_requests_status ON document_requests(status);
CREATE INDEX idx_document_requests_type ON document_requests(document_type_id);
CREATE INDEX idx_document_requests_date ON document_requests(requested_at DESC);

-- Incident reports indexes
CREATE INDEX idx_incident_reports_complainant ON incident_reports(complainant_id);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_date ON incident_reports(incident_date DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON document_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE user_profiles IS 'Extended user information beyond Supabase auth';
COMMENT ON TABLE residents IS 'Barangay resident registry with household relationships';
COMMENT ON TABLE households IS 'Household information and family structures';
COMMENT ON TABLE announcements IS 'Public announcements and community notices';
COMMENT ON TABLE document_types IS 'Available document types and their requirements';
COMMENT ON TABLE document_requests IS 'Document application and processing workflow';
COMMENT ON TABLE incident_reports IS 'Incident reports and blotter entries';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for compliance and security';
