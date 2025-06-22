'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import StreamViewer from '@/components/streaming/StreamViewer';
import { useStreaming } from '@/hooks/useStreaming';

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
  recording_url?: string;
  hls_url?: string;
  created_by_user?: {
    user_metadata: {
      full_name?: string;
    };
  };
}

const categoryLabels = {
  meeting: 'Barangay Meeting',
  emergency: 'Emergency Broadcast',
  event: 'Community Event',
  announcement: 'Public Announcement',
  education: 'Educational Content'
};

const categoryColors = {
  meeting: 'bg-blue-100 text-blue-800',
  emergency: 'bg-red-100 text-red-800',
  event: 'bg-green-100 text-green-800',
  announcement: 'bg-yellow-100 text-yellow-800',
  education: 'bg-purple-100 text-purple-800'
};

export default function StreamPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  const { currentStream, loading, error, fetchStream, joinStream } = useStreaming();
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    if (streamId) {
      fetchStream(streamId);
    }
  }, [streamId]);

  useEffect(() => {
    // Auto-join stream if it's live and public
    if (currentStream && currentStream.status === 'live' && currentStream.is_public && !viewerId) {
      joinStream(streamId).then(setViewerId);
    }
  }, [currentStream, streamId, viewerId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      live: 'bg-red-100 text-red-800 animate-pulse',
      scheduled: 'bg-blue-100 text-blue-800',
      ended: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    
    const labels = {
      live: '🔴 LIVE',
      scheduled: '📅 Scheduled',
      ended: '📼 Recorded',
      cancelled: '❌ Cancelled'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges] || badges.ended}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentStream?.title,
          text: currentStream?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !currentStream) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stream Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The stream you are looking for does not exist or is not available.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/streaming"
              className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse All Streams
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if stream is private and user doesn't have access
  if (!currentStream.is_public) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Private Stream</h2>
          <p className="text-gray-600 mb-6">
            This stream is private and requires special access permissions.
          </p>
          <Link
            href="/streaming"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Public Streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/streaming"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Streams
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stream Player */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <StreamViewer streamId={currentStream.id} />
            </div>

            {/* Stream Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentStream.title}
                    </h1>
                    {getStatusBadge(currentStream.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className={`px-2 py-1 rounded-full ${categoryColors[currentStream.category]}`}>
                      {categoryLabels[currentStream.category]}
                    </span>
                    
                    {currentStream.status === 'live' && (
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {currentStream.viewer_count} watching
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(currentStream.started_at || currentStream.scheduled_at || currentStream.ended_at)}
                    </div>
                  </div>
                </div>
              </div>

              {currentStream.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {currentStream.description}
                  </p>
                </div>
              )}

              {/* Stream Stats */}
              {(currentStream.peak_viewer_count > 0 || currentStream.status === 'ended') && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Stream Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {currentStream.peak_viewer_count > 0 && (
                      <div>
                        <span className="text-gray-600">Peak Viewers:</span>
                        <span className="ml-2 font-medium">{currentStream.peak_viewer_count}</span>
                      </div>
                    )}
                    {currentStream.status === 'ended' && currentStream.started_at && currentStream.ended_at && (
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">
                          {Math.round((new Date(currentStream.ended_at).getTime() - new Date(currentStream.started_at).getTime()) / (1000 * 60))} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Stream Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stream Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(currentStream.status)}
                </div>
                
                {currentStream.status === 'live' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Viewers:</span>
                    <span className="font-medium">{currentStream.viewer_count}</span>
                  </div>
                )}
                
                {currentStream.status === 'scheduled' && currentStream.scheduled_at && (
                  <div>
                    <span className="text-gray-600 block mb-1">Starts:</span>
                    <span className="font-medium text-sm">
                      {formatDate(currentStream.scheduled_at)}
                    </span>
                  </div>
                )}
                
                {currentStream.status === 'ended' && currentStream.ended_at && (
                  <div>
                    <span className="text-gray-600 block mb-1">Ended:</span>
                    <span className="font-medium text-sm">
                      {formatDate(currentStream.ended_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Having trouble with the stream? Check our help guide or contact support.
              </p>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
