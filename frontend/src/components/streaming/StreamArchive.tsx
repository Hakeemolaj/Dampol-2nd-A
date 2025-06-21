'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface StreamRecording {
  id: string;
  title: string;
  description?: string;
  category: 'meeting' | 'emergency' | 'event' | 'announcement' | 'education';
  recording_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  final_viewer_count: number;
  peak_viewer_count: number;
  started_at: string;
  ended_at: string;
  created_by_user?: {
    user_metadata: {
      full_name?: string;
    };
  };
}

interface StreamArchiveProps {
  className?: string;
}

export default function StreamArchive({ className = '' }: StreamArchiveProps) {
  const [recordings, setRecordings] = useState<StreamRecording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<StreamRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'duration'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
  const ITEMS_PER_PAGE = 12;

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📺' },
    { value: 'meeting', label: 'Meetings', icon: '🏛️' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'event', label: 'Events', icon: '🎉' },
    { value: 'announcement', label: 'Announcements', icon: '📢' },
    { value: 'education', label: 'Education', icon: '📚' }
  ];

  useEffect(() => {
    fetchRecordings();
  }, [currentPage, sortBy]);

  useEffect(() => {
    filterRecordings();
  }, [recordings, searchTerm, selectedCategory]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: 'ended',
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });

      const response = await fetch(`${API_BASE}/streams?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.data || []);
        setTotalPages(Math.ceil(data.pagination?.total / ITEMS_PER_PAGE) || 1);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecordings = () => {
    let filtered = recordings.filter(recording => {
      const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recording.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || recording.category === selectedCategory;
      return matchesSearch && matchesCategory && recording.recording_url;
    });

    // Sort recordings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        case 'views':
          return b.final_viewer_count - a.final_viewer_count;
        case 'duration':
          return (b.duration_seconds || 0) - (a.duration_seconds || 0);
        default:
          return 0;
      }
    });

    setFilteredRecordings(filtered);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📺';
  };

  if (loading && recordings.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recordings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stream Archive</h1>
            <p className="text-gray-600">Browse past meetings, events, and announcements</p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredRecordings.length} recordings available
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'views' | 'duration')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="views">Sort by Views</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {/* Recordings Grid */}
      {filteredRecordings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📹</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recordings found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No stream recordings are available yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <RecordingCard key={recording.id} recording={recording} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Recording Card Component
function RecordingCard({ recording }: { recording: StreamRecording }) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
        {recording.thumbnail_url ? (
          <img
            src={recording.thumbnail_url}
            alt={recording.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl">{getCategoryIcon(recording.category)}</div>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white bg-opacity-90 rounded-full p-3">
            <PlayIcon className="h-8 w-8 text-gray-900" />
          </div>
        </div>

        {/* Duration Badge */}
        {recording.duration_seconds && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(recording.duration_seconds)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">{getCategoryIcon(recording.category)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
              {recording.title}
            </h3>
            <div className="text-sm text-gray-500 capitalize">
              {recording.category}
            </div>
          </div>
        </div>

        {recording.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {recording.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {formatDate(recording.started_at)}
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="h-3 w-3" />
            {recording.final_viewer_count} views
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.open(`/streams/${recording.id}`, '_blank')}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <PlayIcon className="h-4 w-4" />
            Watch
          </button>
          <button
            onClick={() => window.open(recording.recording_url, '_blank')}
            className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center"
            title="Download"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
