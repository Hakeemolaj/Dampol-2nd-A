-- Barangay Hall Web Application Database Schema
-- PostgreSQL 15+ with Supabase
-- Designed for Data Privacy Act compliance and audit requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    civil_status VARCHAR(20) CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced')),
    occupation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES auth.users(id),
    role_id UUID REFERENCES roles(id),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, role_id)
);

-- =============================================
-- RESIDENT MANAGEMENT
-- =============================================

-- Households
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

-- Residents
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
-- DOCUMENT MANAGEMENT
-- =============================================

-- Document types and their requirements
CREATE TABLE document_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requirements JSONB DEFAULT '[]',
    fee DECIMAL(8,2) DEFAULT 0,
    processing_time_days INTEGER DEFAULT 1,
    validity_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document requests
CREATE TABLE document_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    document_type_id UUID REFERENCES document_types(id),
    applicant_id UUID REFERENCES auth.users(id),
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Ready', 'Released', 'Rejected')),
    fee_amount DECIMAL(8,2),
    payment_status VARCHAR(20) DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Paid', 'Waived')),
    payment_reference VARCHAR(50),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document attachments and files
CREATE TABLE document_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES document_requests(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADMINISTRATIVE FUNCTIONS
-- =============================================

-- Barangay officials
CREATE TABLE barangay_officials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    position VARCHAR(100) NOT NULL,
    committee VARCHAR(100),
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements and news
CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    author_id UUID REFERENCES auth.users(id),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events and activities
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    organizer_id UUID REFERENCES auth.users(id),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Ongoing', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CASE MANAGEMENT (BLOTTER)
-- =============================================

-- Incident reports and blotter entries
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
-- FINANCIAL MANAGEMENT
-- =============================================

-- Budget tracking
CREATE TABLE budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    allocated_amount DECIMAL(15,2) NOT NULL,
    utilized_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue and collections
CREATE TABLE revenue_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    collected_by UUID REFERENCES auth.users(id),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    receipt_number VARCHAR(50),
    payer_name VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMPLIANCE & AUDIT
-- =============================================

-- Audit logs for all system activities
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data privacy consent records
CREATE TABLE consent_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    purpose VARCHAR(200) NOT NULL,
    consent_text TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FOI requests tracking
CREATE TABLE foi_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    requester_name VARCHAR(200) NOT NULL,
    requester_email VARCHAR(200),
    requester_phone VARCHAR(20),
    information_requested TEXT NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'Received' CHECK (status IN ('Received', 'Processing', 'Ready', 'Released', 'Denied')),
    assigned_to UUID REFERENCES auth.users(id),
    response TEXT,
    denial_reason TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User and resident indexes
CREATE INDEX idx_user_profiles_name ON user_profiles(last_name, first_name);
CREATE INDEX idx_residents_household ON residents(household_id);
CREATE INDEX idx_residents_status ON residents(status);

-- Document request indexes
CREATE INDEX idx_document_requests_applicant ON document_requests(applicant_id);
CREATE INDEX idx_document_requests_status ON document_requests(status);
CREATE INDEX idx_document_requests_date ON document_requests(requested_at);

-- Audit and compliance indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be expanded)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Barangay Captain with full system access', '{"all": true}'),
('admin', 'Barangay Secretary with administrative access', '{"residents": true, "documents": true, "reports": true}'),
('staff', 'Barangay Staff with limited access', '{"documents": true, "announcements": true}'),
('resident', 'Registered resident with basic access', '{"profile": true, "documents": true}');

-- Insert common document types
INSERT INTO document_types (name, description, fee, processing_time_days) VALUES
('Barangay Clearance', 'Certificate of good moral character', 50.00, 1),
('Certificate of Residency', 'Proof of residence in the barangay', 30.00, 1),
('Certificate of Indigency', 'Certificate for low-income residents', 0.00, 2),
('Business Permit', 'Permit for small business operations', 100.00, 3),
('Barangay ID', 'Official barangay identification card', 25.00, 5);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE user_profiles IS 'Extended user information beyond Supabase auth';
COMMENT ON TABLE residents IS 'Barangay resident registry with household relationships';
COMMENT ON TABLE document_requests IS 'Document application and processing workflow';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for compliance and security';
COMMENT ON TABLE consent_records IS 'Data Privacy Act consent management';
COMMENT ON TABLE foi_requests IS 'Freedom of Information Act request tracking';
