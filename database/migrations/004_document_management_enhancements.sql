-- Enhanced Document Management Migration
-- This migration adds advanced document management features

-- =============================================
-- DOCUMENT ATTACHMENTS
-- =============================================

CREATE TABLE document_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    attachment_type VARCHAR(50) DEFAULT 'requirement' CHECK (attachment_type IN ('requirement', 'supporting', 'output', 'signature')),
    is_required BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT TEMPLATES
-- =============================================

CREATE TABLE document_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_type_id UUID REFERENCES document_types(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB, -- Template variables like {{resident_name}}, {{date}}, etc.
    header_content TEXT,
    footer_content TEXT,
    page_size VARCHAR(20) DEFAULT 'A4',
    orientation VARCHAR(20) DEFAULT 'portrait',
    margins JSONB DEFAULT '{"top": 20, "right": 20, "bottom": 20, "left": 20}',
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT SIGNATURES
-- =============================================

CREATE TABLE document_signatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES auth.users(id) NOT NULL,
    signer_role VARCHAR(100) NOT NULL,
    signature_type VARCHAR(50) DEFAULT 'digital' CHECK (signature_type IN ('digital', 'electronic', 'wet')),
    signature_data TEXT, -- Base64 encoded signature or file path
    signature_hash VARCHAR(255), -- Hash for verification
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT WORKFLOW STEPS
-- =============================================

CREATE TABLE document_workflow_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_type_id UUID REFERENCES document_types(id) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    assigned_role VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    estimated_duration_hours INTEGER DEFAULT 24,
    instructions TEXT,
    auto_approve_conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_type_id, step_order)
);

-- =============================================
-- DOCUMENT REQUEST WORKFLOW TRACKING
-- =============================================

CREATE TABLE document_request_workflow (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES document_workflow_steps(id) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT BATCHES (for bulk processing)
-- =============================================

CREATE TABLE document_batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_name VARCHAR(200) NOT NULL,
    batch_type VARCHAR(50) NOT NULL,
    document_type_id UUID REFERENCES document_types(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    total_requests INTEGER DEFAULT 0,
    processed_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link document requests to batches
ALTER TABLE document_requests ADD COLUMN batch_id UUID REFERENCES document_batches(id);

-- =============================================
-- DOCUMENT AUDIT TRAIL
-- =============================================

CREATE TABLE document_audit_trail (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCUMENT FEES AND PAYMENTS
-- =============================================

CREATE TABLE document_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'waived')),
    paid_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    payment_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Document attachments indexes
CREATE INDEX idx_document_attachments_request_id ON document_attachments(document_request_id);
CREATE INDEX idx_document_attachments_type ON document_attachments(attachment_type);
CREATE INDEX idx_document_attachments_uploaded_by ON document_attachments(uploaded_by);

-- Document templates indexes
CREATE INDEX idx_document_templates_type_id ON document_templates(document_type_id);
CREATE INDEX idx_document_templates_active ON document_templates(is_active);

-- Document signatures indexes
CREATE INDEX idx_document_signatures_request_id ON document_signatures(document_request_id);
CREATE INDEX idx_document_signatures_signer ON document_signatures(signer_id);
CREATE INDEX idx_document_signatures_signed_at ON document_signatures(signed_at DESC);

-- Workflow steps indexes
CREATE INDEX idx_workflow_steps_document_type ON document_workflow_steps(document_type_id);
CREATE INDEX idx_workflow_steps_order ON document_workflow_steps(document_type_id, step_order);

-- Workflow tracking indexes
CREATE INDEX idx_request_workflow_request_id ON document_request_workflow(document_request_id);
CREATE INDEX idx_request_workflow_step_id ON document_request_workflow(workflow_step_id);
CREATE INDEX idx_request_workflow_assigned_to ON document_request_workflow(assigned_to);
CREATE INDEX idx_request_workflow_status ON document_request_workflow(status);

-- Document batches indexes
CREATE INDEX idx_document_batches_created_by ON document_batches(created_by);
CREATE INDEX idx_document_batches_status ON document_batches(status);
CREATE INDEX idx_document_batches_type ON document_batches(document_type_id);

-- Audit trail indexes
CREATE INDEX idx_document_audit_request_id ON document_audit_trail(document_request_id);
CREATE INDEX idx_document_audit_performed_by ON document_audit_trail(performed_by);
CREATE INDEX idx_document_audit_created_at ON document_audit_trail(created_at DESC);

-- Payment indexes
CREATE INDEX idx_document_payments_request_id ON document_payments(document_request_id);
CREATE INDEX idx_document_payments_status ON document_payments(payment_status);
CREATE INDEX idx_document_payments_paid_at ON document_payments(paid_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers
CREATE TRIGGER update_document_attachments_updated_at BEFORE UPDATE ON document_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_workflow_steps_updated_at BEFORE UPDATE ON document_workflow_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_request_workflow_updated_at BEFORE UPDATE ON document_request_workflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_batches_updated_at BEFORE UPDATE ON document_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_payments_updated_at BEFORE UPDATE ON document_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger for document requests
CREATE OR REPLACE FUNCTION create_document_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO document_audit_trail (
        document_request_id,
        action,
        performed_by,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        COALESCE(NEW.processed_by, OLD.processed_by),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
             WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
             ELSE NULL END,
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_requests_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON document_requests
    FOR EACH ROW EXECUTE FUNCTION create_document_audit_trail();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get document request with full workflow status
CREATE OR REPLACE FUNCTION get_document_request_with_workflow(p_request_id UUID)
RETURNS TABLE (
    request_data JSONB,
    workflow_status JSONB,
    attachments JSONB,
    signatures JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(dr.*) as request_data,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'step_name', dws.step_name,
                    'step_order', dws.step_order,
                    'status', drw.status,
                    'assigned_to', drw.assigned_to,
                    'started_at', drw.started_at,
                    'completed_at', drw.completed_at,
                    'comments', drw.comments
                ) ORDER BY dws.step_order
            ) FILTER (WHERE dws.id IS NOT NULL),
            '[]'::jsonb
        ) as workflow_status,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', da.id,
                    'file_name', da.file_name,
                    'file_type', da.file_type,
                    'attachment_type', da.attachment_type,
                    'is_verified', da.is_verified
                )
            ) FILTER (WHERE da.id IS NOT NULL),
            '[]'::jsonb
        ) as attachments,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'signer_role', ds.signer_role,
                    'signed_at', ds.signed_at,
                    'signature_type', ds.signature_type
                )
            ) FILTER (WHERE ds.id IS NOT NULL),
            '[]'::jsonb
        ) as signatures
    FROM document_requests dr
    LEFT JOIN document_request_workflow drw ON dr.id = drw.document_request_id
    LEFT JOIN document_workflow_steps dws ON drw.workflow_step_id = dws.id
    LEFT JOIN document_attachments da ON dr.id = da.document_request_id
    LEFT JOIN document_signatures ds ON dr.id = ds.document_request_id
    WHERE dr.id = p_request_id
    GROUP BY dr.id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE document_attachments IS 'File attachments for document requests including requirements and supporting documents';
COMMENT ON TABLE document_templates IS 'Templates for generating standardized documents';
COMMENT ON TABLE document_signatures IS 'Digital signatures for document approval and authentication';
COMMENT ON TABLE document_workflow_steps IS 'Workflow steps definition for different document types';
COMMENT ON TABLE document_request_workflow IS 'Tracking of workflow progress for each document request';
COMMENT ON TABLE document_batches IS 'Batch processing for multiple document requests';
COMMENT ON TABLE document_audit_trail IS 'Complete audit trail for document request changes';
COMMENT ON TABLE document_payments IS 'Payment tracking for document fees';
