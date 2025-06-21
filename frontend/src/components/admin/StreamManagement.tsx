'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  PlusIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Stream {
  id: string;
  title: string;
  description?: string;
  stream_key: string;
  category: 'meeting' | 'emergency' | 'event' | 'announcement' | 'education';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_public: boolean;
  recording_enabled: boolean;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  peak_viewer_count: number;
  rtmp_url?: string;
  hls_url?: string;
  created_at: string;
}

export default function StreamManagement() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch(`${API_BASE}/streams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStreams(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStream = async (streamData: Partial<Stream>) => {
    try {
      const response = await fetch(`${API_BASE}/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(streamData)
      });

      if (response.ok) {
        const data = await response.json();
        setStreams(prev => [data.data, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating stream:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Stream Management</h1>
          <p className="text-gray-600">Manage live streams for barangay meetings and events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create Stream
        </button>
      </div>

      {/* Live Streams Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Live Streams
          </h2>
        </div>
        <div className="p-6">
          {streams.filter(s => s.status === 'live').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No live streams currently</p>
          ) : (
            <div className="grid gap-4">
              {streams.filter(s => s.status === 'live').map(stream => (
                <StreamCard key={stream.id} stream={stream} onSelect={setSelectedStream} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Streams */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Streams</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stream
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viewers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streams.map(stream => (
                <tr key={stream.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCategoryIcon(stream.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stream.title}</div>
                        <div className="text-sm text-gray-500">{stream.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stream.status)}`}>
                      {stream.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.scheduled_at ? formatDateTime(stream.scheduled_at) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {stream.viewer_count}
                      {stream.peak_viewer_count > 0 && (
                        <span className="text-gray-500">(peak: {stream.peak_viewer_count})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {stream.status === 'scheduled' && (
                        <button className="text-green-600 hover:text-green-900">
                          <PlayIcon className="h-5 w-5" />
                        </button>
                      )}
                      {stream.status === 'live' && (
                        <button className="text-red-600 hover:text-red-900">
                          <StopIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedStream(stream)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Stream Modal */}
      {showCreateModal && (
        <CreateStreamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createStream}
        />
      )}

      {/* Stream Details Modal */}
      {selectedStream && (
        <StreamDetailsModal
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}
    </div>
  );
}

// Stream Card Component
function StreamCard({ stream, onSelect }: { stream: Stream; onSelect: (stream: Stream) => void }) {
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getCategoryIcon(stream.category)}</span>
            <h3 className="text-lg font-semibold text-gray-900">{stream.title}</h3>
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>
          {stream.description && (
            <p className="text-gray-600 mb-3">{stream.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              {stream.viewer_count} viewers
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Started {stream.started_at ? formatDateTime(stream.started_at) : 'Unknown'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(stream)}
            className="bg-white text-gray-700 px-3 py-1 rounded border hover:bg-gray-50"
          >
            View Details
          </button>
          <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
            <StopIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function (moved outside component to avoid re-declaration)
function getCategoryIcon(category: string) {
  switch (category) {
    case 'meeting': return '🏛️';
    case 'emergency': return '🚨';
    case 'event': return '🎉';
    case 'announcement': return '📢';
    case 'education': return '📚';
    default: return '📺';
  }
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Placeholder components (to be implemented)
function CreateStreamModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Stream</h2>
        <p className="text-gray-600 mb-4">Stream creation form will be implemented here.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function StreamDetailsModal({ stream, onClose }: { stream: Stream; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Stream Details</h2>
        <p className="text-gray-600 mb-4">Stream details and controls will be implemented here.</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
