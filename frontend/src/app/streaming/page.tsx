'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlayIcon, 
  EyeIcon, 
  CalendarIcon, 
  ClockIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
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

export default function StreamingPage() {
  const { streams, loading, error, fetchStreams } = useStreaming();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([]);

  useEffect(() => {
    fetchStreams({ is_public: true });
  }, []);

  useEffect(() => {
    let filtered = streams.filter(stream => stream.is_public);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(stream =>
        stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stream.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(stream => stream.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(stream => stream.status === selectedStatus);
    }

    // Sort by status priority (live first, then scheduled, then ended)
    filtered.sort((a, b) => {
      const statusPriority = { live: 0, scheduled: 1, ended: 2, cancelled: 3 };
      const aPriority = statusPriority[a.status] || 4;
      const bPriority = statusPriority[b.status] || 4;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same status, sort by date
      const aDate = new Date(a.started_at || a.scheduled_at || a.ended_at || 0);
      const bDate = new Date(b.started_at || b.scheduled_at || b.ended_at || 0);
      return bDate.getTime() - aDate.getTime();
    });

    setFilteredStreams(filtered);
  }, [streams, searchTerm, selectedCategory, selectedStatus]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.ended}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Streams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStreams({ is_public: true })}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎥 Live Streams & Recordings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch live barangay meetings, emergency broadcasts, community events, and access recorded sessions
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search streams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="live">Live Now</option>
              <option value="scheduled">Upcoming</option>
              <option value="ended">Recordings</option>
            </select>
          </div>
        </div>

        {/* Stream Grid */}
        {filteredStreams.length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No streams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No public streams are currently available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream) => (
              <Link
                key={stream.id}
                href={`/streaming/${stream.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {stream.status === 'live' && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
                        🔴 LIVE
                      </span>
                    </div>
                  )}
                  {stream.viewer_count > 0 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      <EyeIcon className="inline h-3 w-3 mr-1" />
                      {stream.viewer_count}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {stream.title}
                    </h3>
                    {getStatusBadge(stream.status)}
                  </div>

                  {stream.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {stream.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${categoryColors[stream.category]}`}>
                      {categoryLabels[stream.category]}
                    </span>
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(stream.started_at || stream.scheduled_at || stream.ended_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
