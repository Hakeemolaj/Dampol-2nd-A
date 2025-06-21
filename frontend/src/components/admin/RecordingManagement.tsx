'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  DocumentArrowDownIcon, 
  TrashIcon, 
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  FilmIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface Recording {
  id: string;
  stream_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  duration_seconds: number;
  resolution: string;
  status: 'processing' | 'completed' | 'failed' | 'archived';
  is_public: boolean;
  download_enabled: boolean;
  thumbnail_url?: string;
  created_at: string;
  stream: {
    title: string;
    category: string;
    final_viewer_count: number;
  };
}

export default function RecordingManagement() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      // This would fetch from a recordings endpoint
      // For now, we'll simulate the data
      const mockRecordings: Recording[] = [
        {
          id: '1',
          stream_id: 'stream-1',
          file_name: 'barangay-meeting-2024-01-15.mp4',
          file_url: '/recordings/barangay-meeting-2024-01-15.mp4',
          file_size_bytes: 1024 * 1024 * 500, // 500MB
          duration_seconds: 3600, // 1 hour
          resolution: '1920x1080',
          status: 'completed',
          is_public: true,
          download_enabled: true,
          thumbnail_url: '/thumbnails/meeting-thumb.jpg',
          created_at: '2024-01-15T10:00:00Z',
          stream: {
            title: 'Monthly Barangay Assembly Meeting',
            category: 'meeting',
            final_viewer_count: 150
          }
        },
        {
          id: '2',
          stream_id: 'stream-2',
          file_name: 'emergency-announcement-2024-01-10.mp4',
          file_url: '/recordings/emergency-announcement-2024-01-10.mp4',
          file_size_bytes: 1024 * 1024 * 200, // 200MB
          duration_seconds: 1800, // 30 minutes
          resolution: '1280x720',
          status: 'completed',
          is_public: true,
          download_enabled: false,
          created_at: '2024-01-10T14:30:00Z',
          stream: {
            title: 'Emergency Weather Alert',
            category: 'emergency',
            final_viewer_count: 300
          }
        }
      ];
      
      setRecordings(mockRecordings);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'meeting': return '🏛️';
      case 'emergency': return '🚨';
      case 'event': return '🎉';
      case 'announcement': return '📢';
      case 'education': return '📚';
      default: return '📺';
    }
  };

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recording.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || recording.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleRecordingSelection = (id: string) => {
    setSelectedRecordings(prev => 
      prev.includes(id) 
        ? prev.filter(recordingId => recordingId !== id)
        : [...prev, id]
    );
  };

  const selectAllRecordings = () => {
    if (selectedRecordings.length === filteredRecordings.length) {
      setSelectedRecordings([]);
    } else {
      setSelectedRecordings(filteredRecordings.map(r => r.id));
    }
  };

  const deleteRecording = async (id: string) => {
    if (confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      try {
        // API call to delete recording
        setRecordings(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting recording:', error);
      }
    }
  };

  const bulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedRecordings.length} recordings? This action cannot be undone.`)) {
      try {
        // API call to bulk delete recordings
        setRecordings(prev => prev.filter(r => !selectedRecordings.includes(r.id)));
        setSelectedRecordings([]);
      } catch (error) {
        console.error('Error bulk deleting recordings:', error);
      }
    }
  };

  const togglePublicStatus = async (id: string, isPublic: boolean) => {
    try {
      // API call to update recording visibility
      setRecordings(prev => prev.map(r => 
        r.id === id ? { ...r, is_public: !isPublic } : r
      ));
    } catch (error) {
      console.error('Error updating recording visibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recording Management</h1>
          <p className="text-gray-600">Manage stream recordings and archives</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {recordings.length} recordings • {formatFileSize(recordings.reduce((total, r) => total + r.file_size_bytes, 0))} total
          </span>
        </div>
      </div>

      {/* Filters and Search */}
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

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedRecordings.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={bulkDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete ({selectedRecordings.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recordings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecordings.length === filteredRecordings.length && filteredRecordings.length > 0}
                    onChange={selectAllRecordings}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recording
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecordings.map((recording) => (
                <tr key={recording.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecordings.includes(recording.id)}
                      onChange={() => toggleRecordingSelection(recording.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-16 bg-gray-200 rounded overflow-hidden">
                        {recording.thumbnail_url ? (
                          <img
                            src={recording.thumbnail_url}
                            alt={recording.stream.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FilmIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(recording.stream.category)}</span>
                          <div className="text-sm font-medium text-gray-900">
                            {recording.stream.title}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {recording.file_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        {formatDuration(recording.duration_seconds)}
                      </div>
                      <div>{formatFileSize(recording.file_size_bytes)}</div>
                      <div className="text-gray-500">{recording.resolution}</div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        {recording.stream.final_viewer_count} views
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recording.status)}`}>
                      {recording.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublicStatus(recording.id, recording.is_public)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        recording.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {recording.is_public ? 'Public' : 'Private'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/streams/${recording.stream_id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Watch recording"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                      {recording.download_enabled && (
                        <button
                          onClick={() => window.open(recording.file_url, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Download recording"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit recording"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete recording"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecordings.length === 0 && (
          <div className="text-center py-12">
            <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recordings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No stream recordings are available yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
