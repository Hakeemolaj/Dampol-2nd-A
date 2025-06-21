-- Enhanced Resident Profile Management Migration
-- This migration adds comprehensive resident profile features

-- =============================================
-- FAMILY RELATIONSHIPS
-- =============================================

CREATE TABLE family_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    related_resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resident_id, related_resident_id, relationship_type)
);

-- =============================================
-- EMERGENCY CONTACTS (Enhanced)
-- =============================================

CREATE TABLE emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    contact_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_local BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT HEALTH INFORMATION
-- =============================================

CREATE TABLE resident_health_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE UNIQUE,
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_conditions TEXT,
    medications TEXT,
    emergency_medical_info TEXT,
    health_insurance_provider VARCHAR(200),
    health_insurance_number VARCHAR(100),
    philhealth_number VARCHAR(20),
    last_medical_checkup DATE,
    vaccination_records JSONB,
    is_pregnant BOOLEAN,
    pregnancy_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT EDUCATION INFORMATION
-- =============================================

CREATE TABLE resident_education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    education_level VARCHAR(100) NOT NULL,
    institution_name VARCHAR(200),
    course_program VARCHAR(200),
    year_graduated INTEGER,
    is_current BOOLEAN DEFAULT FALSE,
    achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT EMPLOYMENT INFORMATION
-- =============================================

CREATE TABLE resident_employment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    employer_name VARCHAR(200),
    job_title VARCHAR(200),
    employment_type VARCHAR(50) CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Self-employed', 'Unemployed', 'Student', 'Retired')),
    monthly_income DECIMAL(12,2),
    work_address TEXT,
    work_phone VARCHAR(20),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    skills TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT ASSETS AND PROPERTIES
-- =============================================

CREATE TABLE resident_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL,
    asset_description TEXT NOT NULL,
    estimated_value DECIMAL(15,2),
    acquisition_date DATE,
    location TEXT,
    documents JSONB,
    is_primary_residence BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT SOCIAL SERVICES
-- =============================================

CREATE TABLE resident_social_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    service_provider VARCHAR(200),
    service_description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed', 'Suspended')),
    benefits_received TEXT,
    case_worker VARCHAR(200),
    case_worker_contact VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT DOCUMENTS AND IDs
-- =============================================

CREATE TABLE resident_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    issuing_authority VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    file_path VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESIDENT PREFERENCES
-- =============================================

CREATE TABLE resident_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE UNIQUE,
    preferred_language VARCHAR(50) DEFAULT 'Filipino',
    communication_preferences JSONB DEFAULT '{"email": true, "sms": true, "phone": false}',
    privacy_settings JSONB DEFAULT '{"show_in_directory": false, "share_contact_info": false}',
    accessibility_needs TEXT,
    dietary_restrictions TEXT,
    religious_affiliation VARCHAR(100),
    cultural_background VARCHAR(100),
    interests_hobbies TEXT,
    volunteer_availability BOOLEAN DEFAULT FALSE,
    skills_to_share TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- HOUSEHOLD ENHANCEMENTS
-- =============================================

-- Add more fields to households table
ALTER TABLE households ADD COLUMN IF NOT EXISTS household_size INTEGER DEFAULT 1;
ALTER TABLE households ADD COLUMN IF NOT EXISTS dwelling_type VARCHAR(100);
ALTER TABLE households ADD COLUMN IF NOT EXISTS ownership_status VARCHAR(50);
ALTER TABLE households ADD COLUMN IF NOT EXISTS utilities JSONB;
ALTER TABLE households ADD COLUMN IF NOT EXISTS amenities JSONB;
ALTER TABLE households ADD COLUMN IF NOT EXISTS accessibility_features JSONB;

-- =============================================
-- RESIDENT ENHANCEMENTS
-- =============================================

-- Add more fields to residents table
ALTER TABLE residents ADD COLUMN IF NOT EXISTS birth_place VARCHAR(200);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'Filipino';
ALTER TABLE residents ADD COLUMN IF NOT EXISTS religion VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS mother_maiden_name VARCHAR(200);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS distinguishing_marks TEXT;

-- =============================================
-- INDEXES
-- =============================================

-- Family relationships indexes
CREATE INDEX idx_family_relationships_resident_id ON family_relationships(resident_id);
CREATE INDEX idx_family_relationships_related_resident_id ON family_relationships(related_resident_id);
CREATE INDEX idx_family_relationships_type ON family_relationships(relationship_type);

-- Emergency contacts indexes
CREATE INDEX idx_emergency_contacts_resident_id ON emergency_contacts(resident_id);
CREATE INDEX idx_emergency_contacts_primary ON emergency_contacts(is_primary);

-- Health info indexes
CREATE INDEX idx_resident_health_info_resident_id ON resident_health_info(resident_id);
CREATE INDEX idx_resident_health_info_blood_type ON resident_health_info(blood_type);

-- Education indexes
CREATE INDEX idx_resident_education_resident_id ON resident_education(resident_id);
CREATE INDEX idx_resident_education_level ON resident_education(education_level);
CREATE INDEX idx_resident_education_current ON resident_education(is_current);

-- Employment indexes
CREATE INDEX idx_resident_employment_resident_id ON resident_employment(resident_id);
CREATE INDEX idx_resident_employment_type ON resident_employment(employment_type);
CREATE INDEX idx_resident_employment_current ON resident_employment(is_current);

-- Assets indexes
CREATE INDEX idx_resident_assets_resident_id ON resident_assets(resident_id);
CREATE INDEX idx_resident_assets_type ON resident_assets(asset_type);

-- Social services indexes
CREATE INDEX idx_resident_social_services_resident_id ON resident_social_services(resident_id);
CREATE INDEX idx_resident_social_services_type ON resident_social_services(service_type);
CREATE INDEX idx_resident_social_services_status ON resident_social_services(status);

-- Documents indexes
CREATE INDEX idx_resident_documents_resident_id ON resident_documents(resident_id);
CREATE INDEX idx_resident_documents_type ON resident_documents(document_type);
CREATE INDEX idx_resident_documents_verified ON resident_documents(is_verified);

-- Preferences indexes
CREATE INDEX idx_resident_preferences_resident_id ON resident_preferences(resident_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers
CREATE TRIGGER update_family_relationships_updated_at BEFORE UPDATE ON family_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_health_info_updated_at BEFORE UPDATE ON resident_health_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_education_updated_at BEFORE UPDATE ON resident_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_employment_updated_at BEFORE UPDATE ON resident_employment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_assets_updated_at BEFORE UPDATE ON resident_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_social_services_updated_at BEFORE UPDATE ON resident_social_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_documents_updated_at BEFORE UPDATE ON resident_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resident_preferences_updated_at BEFORE UPDATE ON resident_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get complete resident profile
CREATE OR REPLACE FUNCTION get_complete_resident_profile(p_resident_id UUID)
RETURNS TABLE (
    basic_info JSONB,
    health_info JSONB,
    education JSONB,
    employment JSONB,
    emergency_contacts JSONB,
    family_relationships JSONB,
    assets JSONB,
    social_services JSONB,
    documents JSONB,
    preferences JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(r.*) as basic_info,
        to_jsonb(rhi.*) as health_info,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(re.*)) FILTER (WHERE re.id IS NOT NULL),
            '[]'::jsonb
        ) as education,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(rem.*)) FILTER (WHERE rem.id IS NOT NULL),
            '[]'::jsonb
        ) as employment,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(ec.*)) FILTER (WHERE ec.id IS NOT NULL),
            '[]'::jsonb
        ) as emergency_contacts,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(fr.*)) FILTER (WHERE fr.id IS NOT NULL),
            '[]'::jsonb
        ) as family_relationships,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(ra.*)) FILTER (WHERE ra.id IS NOT NULL),
            '[]'::jsonb
        ) as assets,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(rss.*)) FILTER (WHERE rss.id IS NOT NULL),
            '[]'::jsonb
        ) as social_services,
        COALESCE(
            jsonb_agg(DISTINCT to_jsonb(rd.*)) FILTER (WHERE rd.id IS NOT NULL),
            '[]'::jsonb
        ) as documents,
        to_jsonb(rp.*) as preferences
    FROM residents r
    LEFT JOIN resident_health_info rhi ON r.id = rhi.resident_id
    LEFT JOIN resident_education re ON r.id = re.resident_id
    LEFT JOIN resident_employment rem ON r.id = rem.resident_id
    LEFT JOIN emergency_contacts ec ON r.id = ec.resident_id
    LEFT JOIN family_relationships fr ON r.id = fr.resident_id
    LEFT JOIN resident_assets ra ON r.id = ra.resident_id
    LEFT JOIN resident_social_services rss ON r.id = rss.resident_id
    LEFT JOIN resident_documents rd ON r.id = rd.resident_id
    LEFT JOIN resident_preferences rp ON r.id = rp.resident_id
    WHERE r.id = p_resident_id
    GROUP BY r.id, rhi.id, rp.id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE family_relationships IS 'Family relationships between residents';
COMMENT ON TABLE emergency_contacts IS 'Emergency contact information for residents';
COMMENT ON TABLE resident_health_info IS 'Health and medical information for residents';
COMMENT ON TABLE resident_education IS 'Educational background and achievements';
COMMENT ON TABLE resident_employment IS 'Employment history and current job information';
COMMENT ON TABLE resident_assets IS 'Assets and properties owned by residents';
COMMENT ON TABLE resident_social_services IS 'Social services and benefits received';
COMMENT ON TABLE resident_documents IS 'Government IDs and important documents';
COMMENT ON TABLE resident_preferences IS 'Personal preferences and settings';
