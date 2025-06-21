-- Live Streaming System Migration
-- This migration creates comprehensive live streaming capabilities for barangay meetings and events

-- =============================================
-- STREAMS TABLE
-- =============================================

CREATE TABLE streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'meeting' CHECK (category IN ('meeting', 'emergency', 'event', 'announcement', 'education')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    is_public BOOLEAN DEFAULT TRUE,
    recording_enabled BOOLEAN DEFAULT TRUE,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Viewer metrics
    viewer_count INTEGER DEFAULT 0,
    peak_viewer_count INTEGER DEFAULT 0,
    final_viewer_count INTEGER DEFAULT 0,
    
    -- Recording and streaming URLs
    recording_url TEXT,
    recording_path TEXT,
    hls_url TEXT,
    rtmp_url TEXT,
    
    -- Metadata
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STREAM VIEWERS TABLE
-- =============================================

CREATE TABLE stream_viewers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100) NOT NULL, -- For anonymous viewers
    
    -- Session tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration_seconds INTEGER DEFAULT 0,
    
    -- Technical details
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    location_data JSONB,
    
    -- Engagement metrics
    chat_messages_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STREAM CHAT TABLE
-- =============================================

CREATE TABLE stream_chat (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    viewer_session_id UUID REFERENCES stream_viewers(id),
    
    -- Message content
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'reaction', 'system')),
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_reason TEXT,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES stream_chat(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STREAM RECORDINGS TABLE
-- =============================================

CREATE TABLE stream_recordings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    
    -- Video metadata
    resolution VARCHAR(20), -- e.g., "1920x1080"
    bitrate INTEGER,
    frame_rate DECIMAL(5,2),
    codec VARCHAR(50),
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'archived')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    
    -- Access control
    is_public BOOLEAN DEFAULT TRUE,
    download_enabled BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    thumbnail_url TEXT,
    preview_url TEXT,
    chapters JSONB, -- For video chapters/timestamps
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STREAM ANALYTICS TABLE
-- =============================================

CREATE TABLE stream_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    
    -- Time-based metrics (hourly aggregation)
    hour_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Viewer metrics
    unique_viewers INTEGER DEFAULT 0,
    concurrent_viewers INTEGER DEFAULT 0,
    peak_concurrent_viewers INTEGER DEFAULT 0,
    total_watch_time_seconds BIGINT DEFAULT 0,
    average_watch_time_seconds INTEGER DEFAULT 0,
    
    -- Engagement metrics
    chat_messages INTEGER DEFAULT 0,
    reactions INTEGER DEFAULT 0,
    new_joins INTEGER DEFAULT 0,
    viewer_drops INTEGER DEFAULT 0,
    
    -- Technical metrics
    stream_quality_score DECIMAL(3,2), -- 0.00 to 5.00
    buffering_events INTEGER DEFAULT 0,
    connection_issues INTEGER DEFAULT 0,
    
    -- Geographic data
    viewer_locations JSONB,
    device_breakdown JSONB,
    browser_breakdown JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per stream per hour
    UNIQUE(stream_id, hour_timestamp)
);

-- =============================================
-- STREAM REACTIONS TABLE
-- =============================================

CREATE TABLE stream_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    viewer_session_id UUID REFERENCES stream_viewers(id),
    
    -- Reaction details
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry'
    reaction_emoji VARCHAR(10),
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stream_time_seconds INTEGER, -- Time in stream when reaction occurred
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STREAM MODERATORS TABLE
-- =============================================

CREATE TABLE stream_moderators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Moderator permissions
    can_moderate_chat BOOLEAN DEFAULT TRUE,
    can_ban_users BOOLEAN DEFAULT FALSE,
    can_control_stream BOOLEAN DEFAULT FALSE,
    
    -- Audit
    assigned_by UUID REFERENCES auth.users(id) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique moderator per stream
    UNIQUE(stream_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Streams indexes
CREATE INDEX idx_streams_status ON streams(status);
CREATE INDEX idx_streams_category ON streams(category);
CREATE INDEX idx_streams_scheduled_at ON streams(scheduled_at);
CREATE INDEX idx_streams_created_by ON streams(created_by);
CREATE INDEX idx_streams_is_public ON streams(is_public);

-- Stream viewers indexes
CREATE INDEX idx_stream_viewers_stream_id ON stream_viewers(stream_id);
CREATE INDEX idx_stream_viewers_user_id ON stream_viewers(user_id);
CREATE INDEX idx_stream_viewers_joined_at ON stream_viewers(joined_at);
CREATE INDEX idx_stream_viewers_session_id ON stream_viewers(session_id);

-- Stream chat indexes
CREATE INDEX idx_stream_chat_stream_id ON stream_chat(stream_id);
CREATE INDEX idx_stream_chat_user_id ON stream_chat(user_id);
CREATE INDEX idx_stream_chat_timestamp ON stream_chat(timestamp);
CREATE INDEX idx_stream_chat_moderated ON stream_chat(is_moderated);

-- Stream recordings indexes
CREATE INDEX idx_stream_recordings_stream_id ON stream_recordings(stream_id);
CREATE INDEX idx_stream_recordings_status ON stream_recordings(status);
CREATE INDEX idx_stream_recordings_is_public ON stream_recordings(is_public);

-- Stream analytics indexes
CREATE INDEX idx_stream_analytics_stream_id ON stream_analytics(stream_id);
CREATE INDEX idx_stream_analytics_hour_timestamp ON stream_analytics(hour_timestamp);

-- Stream reactions indexes
CREATE INDEX idx_stream_reactions_stream_id ON stream_reactions(stream_id);
CREATE INDEX idx_stream_reactions_user_id ON stream_reactions(user_id);
CREATE INDEX idx_stream_reactions_timestamp ON stream_reactions(timestamp);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_moderators ENABLE ROW LEVEL SECURITY;

-- Streams policies
CREATE POLICY "Public streams are viewable by everyone" ON streams
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own streams" ON streams
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create streams" ON streams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own streams" ON streams
    FOR UPDATE USING (auth.uid() = created_by);

-- Stream viewers policies
CREATE POLICY "Users can view stream viewer data for public streams" ON stream_viewers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM streams 
            WHERE streams.id = stream_viewers.stream_id 
            AND streams.is_public = true
        )
    );

CREATE POLICY "Users can insert their own viewer sessions" ON stream_viewers
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Stream chat policies
CREATE POLICY "Users can view chat for public streams" ON stream_chat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM streams 
            WHERE streams.id = stream_chat.stream_id 
            AND streams.is_public = true
        )
    );

CREATE POLICY "Authenticated users can send chat messages" ON stream_chat
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON stream_chat
    FOR UPDATE USING (auth.uid() = user_id);

-- Stream recordings policies
CREATE POLICY "Public recordings are viewable by everyone" ON stream_recordings
    FOR SELECT USING (is_public = true);

-- Stream reactions policies
CREATE POLICY "Users can view reactions for public streams" ON stream_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM streams 
            WHERE streams.id = stream_reactions.stream_id 
            AND streams.is_public = true
        )
    );

CREATE POLICY "Authenticated users can add reactions" ON stream_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update stream viewer count
CREATE OR REPLACE FUNCTION update_stream_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE streams 
        SET viewer_count = viewer_count + 1,
            peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1)
        WHERE id = NEW.stream_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.left_at IS NULL AND NEW.left_at IS NOT NULL THEN
        UPDATE streams 
        SET viewer_count = GREATEST(0, viewer_count - 1)
        WHERE id = NEW.stream_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for viewer count updates
CREATE TRIGGER trigger_update_stream_viewer_count
    AFTER INSERT OR UPDATE ON stream_viewers
    FOR EACH ROW EXECUTE FUNCTION update_stream_viewer_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_streams_updated_at
    BEFORE UPDATE ON streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_stream_recordings_updated_at
    BEFORE UPDATE ON stream_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default stream categories
INSERT INTO streams (
    title, 
    description, 
    stream_key, 
    category, 
    status, 
    scheduled_at, 
    created_by
) VALUES 
(
    'Test Stream - Barangay Assembly Meeting',
    'Monthly barangay assembly meeting for community updates and discussions',
    'test-stream-' || uuid_generate_v4(),
    'meeting',
    'scheduled',
    NOW() + INTERVAL '1 hour',
    (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Create sample stream moderator roles
-- This will be populated when users are created

COMMENT ON TABLE streams IS 'Main table for live streams including meetings, events, and announcements';
COMMENT ON TABLE stream_viewers IS 'Tracks individual viewer sessions and engagement metrics';
COMMENT ON TABLE stream_chat IS 'Real-time chat messages during live streams';
COMMENT ON TABLE stream_recordings IS 'Recorded stream files and metadata';
COMMENT ON TABLE stream_analytics IS 'Aggregated analytics data for streams';
COMMENT ON TABLE stream_reactions IS 'User reactions during live streams';
COMMENT ON TABLE stream_moderators IS 'Stream moderation permissions and assignments';
