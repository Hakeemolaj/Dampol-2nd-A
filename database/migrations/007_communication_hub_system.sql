-- Communication Hub System Migration
-- This migration creates comprehensive communication features

-- =============================================
-- COMMUNICATION CHANNELS
-- =============================================

CREATE TABLE communication_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_code VARCHAR(20) UNIQUE NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default communication channels
INSERT INTO communication_channels (channel_code, channel_name, description, configuration) VALUES
('EMAIL', 'Email', 'Email notifications and communications', '{"smtp_host": "", "smtp_port": 587, "smtp_user": "", "smtp_password": ""}'),
('SMS', 'SMS', 'SMS text messaging', '{"provider": "semaphore", "api_key": "", "sender_name": "BARANGAY"}'),
('PUSH', 'Push Notifications', 'Web push notifications', '{"vapid_public_key": "", "vapid_private_key": ""}'),
('BULLETIN', 'Community Bulletin', 'Community bulletin board posts', '{}'),
('SOCIAL', 'Social Media', 'Social media posts and updates', '{"facebook_page": "", "twitter_handle": ""}');

-- =============================================
-- MESSAGE TEMPLATES
-- =============================================

CREATE TABLE message_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB, -- Available variables like {{resident_name}}, {{date}}, etc.
    channel_id UUID REFERENCES communication_channels(id) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default message templates
INSERT INTO message_templates (template_code, template_name, subject_template, body_template, variables, channel_id, category, created_by) VALUES
('EMAIL_DOCUMENT_READY', 'Document Ready for Pickup', 'Your {{document_type}} is Ready for Pickup', 'Dear {{resident_name}},\n\nYour {{document_type}} with request number {{request_number}} is now ready for pickup.\n\nPlease visit the barangay hall during office hours to claim your document.\n\nThank you!', '["resident_name", "document_type", "request_number"]', (SELECT id FROM communication_channels WHERE channel_code = 'EMAIL'), 'Document Services', (SELECT id FROM auth.users LIMIT 1)),
('SMS_DOCUMENT_READY', 'Document Ready SMS', NULL, 'Hi {{resident_name}}! Your {{document_type}} ({{request_number}}) is ready for pickup at the barangay hall. Office hours: 8AM-5PM Mon-Fri.', '["resident_name", "document_type", "request_number"]', (SELECT id FROM communication_channels WHERE channel_code = 'SMS'), 'Document Services', (SELECT id FROM auth.users LIMIT 1)),
('EMAIL_ANNOUNCEMENT', 'Announcement Email', '{{title}}', 'Dear Residents,\n\n{{content}}\n\nFor more information, please contact the barangay hall.\n\nBest regards,\nBarangay Dampol 2nd A', '["title", "content"]', (SELECT id FROM communication_channels WHERE channel_code = 'EMAIL'), 'Announcements', (SELECT id FROM auth.users LIMIT 1));

-- =============================================
-- COMMUNICATION CAMPAIGNS
-- =============================================

CREATE TABLE communication_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_name VARCHAR(200) NOT NULL,
    description TEXT,
    target_audience VARCHAR(100) NOT NULL, -- 'all', 'residents', 'voters', 'seniors', 'pwd', 'custom'
    target_criteria JSONB, -- Custom targeting criteria
    message_template_id UUID REFERENCES message_templates(id) NOT NULL,
    template_variables JSONB, -- Variable values for this campaign
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sending', 'Completed', 'Failed', 'Cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGE QUEUE
-- =============================================

CREATE TABLE message_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES communication_campaigns(id),
    recipient_id UUID REFERENCES auth.users(id),
    recipient_contact VARCHAR(255) NOT NULL, -- email, phone number, etc.
    channel_id UUID REFERENCES communication_channels(id) NOT NULL,
    subject TEXT,
    message_content TEXT NOT NULL,
    priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sending', 'Sent', 'Failed', 'Cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMUNITY BULLETIN BOARD
-- =============================================

CREATE TABLE bulletin_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    target_audience VARCHAR(100) DEFAULT 'all',
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    attachments JSONB,
    tags VARCHAR(500),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived', 'Deleted')),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BULLETIN POST INTERACTIONS
-- =============================================

CREATE TABLE bulletin_post_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES bulletin_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share')),
    comment_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, interaction_type)
);

-- =============================================
-- SMS INTEGRATION
-- =============================================

CREATE TABLE sms_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_queue_id UUID REFERENCES message_queue(id),
    recipient_number VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    cost DECIMAL(10,4),
    response_data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EMAIL INTEGRATION
-- =============================================

CREATE TABLE email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_queue_id UUID REFERENCES message_queue(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT,
    message_content TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    bounce_reason TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTACT GROUPS
-- =============================================

CREATE TABLE contact_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB, -- Criteria for automatic group membership
    is_dynamic BOOLEAN DEFAULT FALSE, -- True if membership is automatically updated
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTACT GROUP MEMBERS
-- =============================================

CREATE TABLE contact_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Communication channels indexes
CREATE INDEX idx_communication_channels_active ON communication_channels(is_active);

-- Message templates indexes
CREATE INDEX idx_message_templates_channel_id ON message_templates(channel_id);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_active ON message_templates(is_active);

-- Communication campaigns indexes
CREATE INDEX idx_communication_campaigns_status ON communication_campaigns(status);
CREATE INDEX idx_communication_campaigns_scheduled_at ON communication_campaigns(scheduled_at);
CREATE INDEX idx_communication_campaigns_created_by ON communication_campaigns(created_by);

-- Message queue indexes
CREATE INDEX idx_message_queue_status ON message_queue(status);
CREATE INDEX idx_message_queue_scheduled_at ON message_queue(scheduled_at);
CREATE INDEX idx_message_queue_priority ON message_queue(priority);
CREATE INDEX idx_message_queue_campaign_id ON message_queue(campaign_id);
CREATE INDEX idx_message_queue_recipient_id ON message_queue(recipient_id);

-- Bulletin posts indexes
CREATE INDEX idx_bulletin_posts_category ON bulletin_posts(category);
CREATE INDEX idx_bulletin_posts_priority ON bulletin_posts(priority);
CREATE INDEX idx_bulletin_posts_status ON bulletin_posts(status);
CREATE INDEX idx_bulletin_posts_published_at ON bulletin_posts(published_at DESC);
CREATE INDEX idx_bulletin_posts_pinned ON bulletin_posts(is_pinned);

-- Bulletin interactions indexes
CREATE INDEX idx_bulletin_interactions_post_id ON bulletin_post_interactions(post_id);
CREATE INDEX idx_bulletin_interactions_user_id ON bulletin_post_interactions(user_id);
CREATE INDEX idx_bulletin_interactions_type ON bulletin_post_interactions(interaction_type);

-- SMS logs indexes
CREATE INDEX idx_sms_logs_recipient_number ON sms_logs(recipient_number);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

-- Email logs indexes
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- Contact groups indexes
CREATE INDEX idx_contact_groups_active ON contact_groups(is_active);
CREATE INDEX idx_contact_groups_dynamic ON contact_groups(is_dynamic);

-- Contact group members indexes
CREATE INDEX idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX idx_contact_group_members_user_id ON contact_group_members(user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers
CREATE TRIGGER update_communication_channels_updated_at BEFORE UPDATE ON communication_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_campaigns_updated_at BEFORE UPDATE ON communication_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_queue_updated_at BEFORE UPDATE ON message_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulletin_posts_updated_at BEFORE UPDATE ON bulletin_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_groups_updated_at BEFORE UPDATE ON contact_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update bulletin post counters
CREATE OR REPLACE FUNCTION update_bulletin_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.interaction_type = 'view' THEN
            UPDATE bulletin_posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'like' THEN
            UPDATE bulletin_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'comment' THEN
            UPDATE bulletin_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE bulletin_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'comment' THEN
            UPDATE bulletin_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bulletin_post_counters_trigger
    AFTER INSERT OR DELETE ON bulletin_post_interactions
    FOR EACH ROW EXECUTE FUNCTION update_bulletin_post_counters();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get communication statistics
CREATE OR REPLACE FUNCTION get_communication_stats(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_campaigns INTEGER,
    active_campaigns INTEGER,
    total_messages_sent INTEGER,
    successful_sends INTEGER,
    failed_sends INTEGER,
    bulletin_posts INTEGER,
    bulletin_interactions INTEGER
) AS $$
DECLARE
    v_start_date DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM communication_campaigns 
         WHERE created_at::DATE BETWEEN v_start_date AND v_end_date) as total_campaigns,
        (SELECT COUNT(*)::INTEGER FROM communication_campaigns 
         WHERE status IN ('Scheduled', 'Sending')) as active_campaigns,
        (SELECT COUNT(*)::INTEGER FROM message_queue 
         WHERE created_at::DATE BETWEEN v_start_date AND v_end_date) as total_messages_sent,
        (SELECT COUNT(*)::INTEGER FROM message_queue 
         WHERE status = 'Sent' AND sent_at::DATE BETWEEN v_start_date AND v_end_date) as successful_sends,
        (SELECT COUNT(*)::INTEGER FROM message_queue 
         WHERE status = 'Failed' AND created_at::DATE BETWEEN v_start_date AND v_end_date) as failed_sends,
        (SELECT COUNT(*)::INTEGER FROM bulletin_posts 
         WHERE published_at::DATE BETWEEN v_start_date AND v_end_date) as bulletin_posts,
        (SELECT COUNT(*)::INTEGER FROM bulletin_post_interactions 
         WHERE created_at::DATE BETWEEN v_start_date AND v_end_date) as bulletin_interactions;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE communication_channels IS 'Available communication channels (email, SMS, push, etc.)';
COMMENT ON TABLE message_templates IS 'Reusable message templates for different communication types';
COMMENT ON TABLE communication_campaigns IS 'Communication campaigns for mass messaging';
COMMENT ON TABLE message_queue IS 'Queue for outgoing messages across all channels';
COMMENT ON TABLE bulletin_posts IS 'Community bulletin board posts and announcements';
COMMENT ON TABLE bulletin_post_interactions IS 'User interactions with bulletin posts';
COMMENT ON TABLE sms_logs IS 'SMS delivery logs and status tracking';
COMMENT ON TABLE email_logs IS 'Email delivery logs and engagement tracking';
COMMENT ON TABLE contact_groups IS 'Contact groups for targeted messaging';
COMMENT ON TABLE contact_group_members IS 'Members of contact groups';
