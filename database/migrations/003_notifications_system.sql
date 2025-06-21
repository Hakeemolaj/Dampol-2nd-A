-- Notifications System Migration
-- This migration creates tables for comprehensive notification management

-- =============================================
-- NOTIFICATION TYPES
-- =============================================

CREATE TABLE notification_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_types (name, description, icon, color) VALUES
('document_status', 'Document request status updates', 'FileText', 'blue'),
('announcement', 'New announcements and community notices', 'Megaphone', 'green'),
('payment_due', 'Payment reminders and due dates', 'CreditCard', 'orange'),
('appointment', 'Appointment reminders and scheduling', 'Calendar', 'purple'),
('emergency', 'Emergency alerts and urgent notices', 'AlertTriangle', 'red'),
('system', 'System updates and maintenance notices', 'Settings', 'gray'),
('welcome', 'Welcome messages for new users', 'UserPlus', 'blue'),
('reminder', 'General reminders and follow-ups', 'Clock', 'yellow');

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id UUID REFERENCES notification_types(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    delivery_method VARCHAR(50)[] DEFAULT ARRAY['in_app'], -- in_app, email, sms
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    related_entity_type VARCHAR(50), -- document_request, announcement, etc.
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATION PREFERENCES
-- =============================================

CREATE TABLE notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',
    preferences JSONB DEFAULT '{}', -- Type-specific preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATION TEMPLATES
-- =============================================

CREATE TABLE notification_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type_id UUID REFERENCES notification_types(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO notification_templates (type_id, name, subject_template, body_template, variables) VALUES
(
    (SELECT id FROM notification_types WHERE name = 'document_status'),
    'Document Status Update',
    'Your {{document_type}} request has been {{status}}',
    'Hello {{user_name}}, your {{document_type}} request ({{request_number}}) has been {{status}}. {{additional_message}}',
    '["user_name", "document_type", "request_number", "status", "additional_message"]'::jsonb
),
(
    (SELECT id FROM notification_types WHERE name = 'announcement'),
    'New Announcement',
    'New Announcement: {{title}}',
    'Hello {{user_name}}, there is a new announcement from the barangay: {{title}}. {{summary}}',
    '["user_name", "title", "summary"]'::jsonb
),
(
    (SELECT id FROM notification_types WHERE name = 'payment_due'),
    'Payment Reminder',
    'Payment Due: {{amount}} for {{service}}',
    'Hello {{user_name}}, you have a payment of ₱{{amount}} due for {{service}}. Due date: {{due_date}}.',
    '["user_name", "amount", "service", "due_date"]'::jsonb
),
(
    (SELECT id FROM notification_types WHERE name = 'emergency'),
    'Emergency Alert',
    'EMERGENCY: {{title}}',
    'EMERGENCY ALERT: {{message}}. Please follow the instructions from barangay officials.',
    '["title", "message"]'::jsonb
);

-- =============================================
-- NOTIFICATION DELIVERY LOG
-- =============================================

CREATE TABLE notification_delivery_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider VARCHAR(50), -- email provider, sms provider, etc.
    provider_response JSONB,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type_id ON notifications(type_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_is_sent ON notifications(is_sent);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Notification templates indexes
CREATE INDEX idx_notification_templates_type_id ON notification_templates(type_id);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);

-- Delivery log indexes
CREATE INDEX idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX idx_notification_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX idx_notification_delivery_log_created_at ON notification_delivery_log(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at triggers
CREATE TRIGGER update_notification_types_updated_at BEFORE UPDATE ON notification_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to mark notification as read when read_at is set
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        NEW.is_read = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_notification_read
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION mark_notification_read();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_user_id UUID,
    p_template_name VARCHAR,
    p_variables JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_related_entity_type VARCHAR DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_template RECORD;
    v_notification_id UUID;
    v_subject TEXT;
    v_body TEXT;
    v_key TEXT;
    v_value TEXT;
BEGIN
    -- Get template
    SELECT nt.*, ntype.name as type_name
    INTO v_template
    FROM notification_templates nt
    JOIN notification_types ntype ON nt.type_id = ntype.id
    WHERE nt.name = p_template_name AND nt.is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Replace variables in subject and body
    v_subject := v_template.subject_template;
    v_body := v_template.body_template;
    
    FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
    LOOP
        v_subject := REPLACE(v_subject, '{{' || v_key || '}}', v_value);
        v_body := REPLACE(v_body, '{{' || v_key || '}}', v_value);
    END LOOP;
    
    -- Create notification
    INSERT INTO notifications (
        user_id,
        type_id,
        title,
        message,
        data,
        scheduled_for,
        related_entity_type,
        related_entity_id
    ) VALUES (
        p_user_id,
        v_template.type_id,
        v_subject,
        v_body,
        p_variables,
        p_scheduled_for,
        p_related_entity_type,
        p_related_entity_id
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
        AND is_read = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE notification_types IS 'Types of notifications available in the system';
COMMENT ON TABLE notifications IS 'Individual notification records for users';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON TABLE notification_templates IS 'Templates for generating notifications';
COMMENT ON TABLE notification_delivery_log IS 'Log of notification delivery attempts and results';
