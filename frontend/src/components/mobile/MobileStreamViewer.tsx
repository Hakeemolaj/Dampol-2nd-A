'use client';

import React, { useState, useEffect } from 'react';
import MobileStreamPlayer from './MobileStreamPlayer';
import MobileStreamChat from './MobileStreamChat';
import StreamReactions from '../streaming/StreamReactions';
import {
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  InformationCircleIcon,
  XMarkIcon
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

interface MobileStreamViewerProps {
  streamId: string;
  className?: string;
}

export default function MobileStreamViewer({ streamId, className = '' }: MobileStreamViewerProps) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [viewerSession, setViewerSession] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
        device_type: 'mobile',
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
    const shareData = {
      title: stream?.title,
      text: stream?.description,
      url: url
    };

    if (navigator.share && isMobile) {
      try {
        await navigator.share(shareData);
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

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would save to local storage or backend
    localStorage.setItem(`bookmark_${streamId}`, (!isBookmarked).toString());
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className={`flex items-center justify-center h-screen ${className}`}>
        <div className="text-center p-6">
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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Video Player */}
      <div className="relative">
        {streamUrl ? (
          <MobileStreamPlayer
            streamId={stream.id}
            hlsUrl={streamUrl}
            isLive={stream.status === 'live'}
            title={stream.title}
            viewerCount={stream.viewer_count}
            onChatToggle={() => setShowChat(true)}
            showChatButton={true}
            className="w-full"
          />
        ) : (
          <div className="bg-gray-900 aspect-video flex items-center justify-center">
            <div className="text-center text-white p-6">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-lg font-semibold mb-2">
                {stream.status === 'scheduled' ? 'Stream Not Started' : 'Stream Unavailable'}
              </h3>
              <p className="text-gray-300 text-sm">
                {stream.status === 'scheduled' 
                  ? 'This stream will begin at the scheduled time.'
                  : 'This stream is no longer available.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setShowChat(true)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stream Info Panel */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(stream.category)}</span>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-2">{stream.title}</h1>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stream.status)}`}>
                {stream.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 capitalize">{stream.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={shareStream}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg hover:bg-gray-100 ${
                isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stream Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {stream.status === 'live' && stream.started_at && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Started {formatDateTime(stream.started_at)}
            </div>
          )}
          
          {stream.status === 'scheduled' && stream.scheduled_at && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {formatDateTime(stream.scheduled_at)}
            </div>
          )}

          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            {stream.viewer_count} {stream.status === 'live' ? 'watching' : 'views'}
          </div>
        </div>
      </div>

      {/* Reactions */}
      {stream.status === 'live' && (
        <div className="bg-white p-4 border-b border-gray-200">
          <StreamReactions
            streamId={stream.id}
            isLive={stream.status === 'live'}
            className="w-full"
          />
        </div>
      )}

      {/* Stream Description */}
      {stream.description && (
        <div className="bg-white p-4">
          <h3 className="font-semibold text-gray-900 mb-2">About this stream</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{stream.description}</p>
        </div>
      )}

      {/* Mobile Chat */}
      <MobileStreamChat
        streamId={stream.id}
        isLive={stream.status === 'live'}
        isVisible={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Stream Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white w-full rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Stream Information</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Title</h3>
                <p className="text-gray-600">{stream.title}</p>
              </div>

              {stream.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-600">{stream.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Category</h3>
                <p className="text-gray-600 capitalize">{stream.category}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Status</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stream.status)}`}>
                  {stream.status.toUpperCase()}
                </span>
              </div>

              {stream.created_by_user?.user_metadata?.full_name && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Hosted by</h3>
                  <p className="text-gray-600">{stream.created_by_user.user_metadata.full_name}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Viewers</h3>
                <p className="text-gray-600">
                  {stream.viewer_count} current • {stream.peak_viewer_count} peak
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
