'use client';

import React, { useState, useEffect } from 'react';
import StreamPlayer from './StreamPlayer';
import StreamChat from './StreamChat';
import { 
  EyeIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface Stream {
  id: string;
  title: string;
  description?: string;
  category: 'meeting' | 'emergency' | 'event' | 'announcement' | 'education';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_public: boolean;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  peak_viewer_count: number;
  hls_url?: string;
  recording_url?: string;
  created_by_user?: {
    user_metadata: {
      full_name?: string;
    };
  };
}

interface StreamViewerProps {
  streamId: string;
  className?: string;
}

export default function StreamViewer({ streamId, className = '' }: StreamViewerProps) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [viewerSession, setViewerSession] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchStream();
    joinStream();

    // Cleanup on unmount
    return () => {
      if (viewerSession) {
        leaveStream();
      }
    };
  }, [streamId]);

  const fetchStream = async () => {
    try {
      const response = await fetch(`${API_BASE}/streams/${streamId}`);
      if (response.ok) {
        const data = await response.json();
        setStream(data.data);
      } else if (response.status === 404) {
        setError('Stream not found');
      } else {
        setError('Failed to load stream');
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setError('Failed to load stream');
    } finally {
      setLoading(false);
    }
  };

  const joinStream = async () => {
    try {
      const deviceInfo = {
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'
      };

      const response = await fetch(`${API_BASE}/stream-chat/${streamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ device_info: deviceInfo })
      });

      if (response.ok) {
        const data = await response.json();
        setViewerSession(data.data.viewer_id);
      }
    } catch (error) {
      console.error('Error joining stream:', error);
    }
  };

  const leaveStream = async () => {
    if (!viewerSession) return;

    try {
      await fetch(`${API_BASE}/stream-chat/${streamId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewer_id: viewerSession })
      });
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  };

  const shareStream = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: stream?.title,
          text: stream?.description,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Stream link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting': return '🏛️';
      case 'emergency': return '🚨';
      case 'event': return '🎉';
      case 'announcement': return '📢';
      case 'education': return '📚';
      default: return '📺';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stream Error</h3>
          <p className="text-gray-600 mb-4">{error || 'Stream not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const streamUrl = stream.status === 'live' ? stream.hls_url : stream.recording_url;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stream Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getCategoryIcon(stream.category)}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{stream.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stream.status)}`}>
                    {stream.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{stream.category}</span>
                </div>
              </div>
            </div>
            
            {stream.description && (
              <p className="text-gray-600 mb-4">{stream.description}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-500">
              {stream.status === 'live' && stream.started_at && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Started {formatDateTime(stream.started_at)}
                </div>
              )}
              
              {stream.status === 'scheduled' && stream.scheduled_at && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Scheduled for {formatDateTime(stream.scheduled_at)}
                </div>
              )}

              {stream.status === 'ended' && stream.ended_at && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Ended {formatDateTime(stream.ended_at)}
                </div>
              )}

              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                {stream.viewer_count} {stream.status === 'live' ? 'watching' : 'views'}
                {stream.peak_viewer_count > 0 && (
                  <span>(peak: {stream.peak_viewer_count})</span>
                )}
              </div>

              {stream.created_by_user?.user_metadata?.full_name && (
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  {stream.created_by_user.user_metadata.full_name}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareStream}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Share stream"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Bookmark stream"
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg ${showChat ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title="Toggle chat"
            >
              <ChatBubbleLeftIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Video Player */}
        <div className="w-full">
          {streamUrl ? (
            <StreamPlayer
              streamId={stream.id}
              hlsUrl={streamUrl}
              isLive={stream.status === 'live'}
              title={stream.title}
              viewerCount={stream.viewer_count}
              showChat={false} // Chat is separate component
              autoPlay={stream.status === 'live'}
              className="w-full"
            />
          ) : (
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-lg font-semibold mb-2">
                  {stream.status === 'scheduled' ? 'Stream Not Started' : 'Stream Unavailable'}
                </h3>
                <p className="text-gray-300">
                  {stream.status === 'scheduled'
                    ? 'This stream will begin at the scheduled time.'
                    : 'This stream is no longer available.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Section - Mobile Optimized */}
        {showChat && (
          <div className="w-full">
            {/* Mobile Chat Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>

            {/* Chat Component */}
            <div className="lg:max-w-md lg:ml-auto">
              <StreamChat
                streamId={stream.id}
                isLive={stream.status === 'live'}
                className="h-full"
                maxHeight="h-[400px] lg:h-[600px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stream Information */}
      {stream.status === 'ended' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600">ℹ️</div>
            <h3 className="font-semibold text-blue-900">Stream Ended</h3>
          </div>
          <p className="text-blue-800">
            This stream has ended. You can still watch the recording above.
            {stream.recording_url && ' The recording is now available for playback.'}
          </p>
        </div>
      )}

      {stream.status === 'scheduled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-yellow-600">⏰</div>
            <h3 className="font-semibold text-yellow-900">Upcoming Stream</h3>
          </div>
          <p className="text-yellow-800">
            This stream is scheduled to begin on {stream.scheduled_at ? formatDateTime(stream.scheduled_at) : 'a future date'}.
            You can bookmark this page to return when the stream starts.
          </p>
        </div>
      )}
    </div>
  );
}
