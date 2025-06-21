'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PlayIcon, 
  StopIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import StreamManagement from '@/components/admin/StreamManagement';

export default function AdminStreamingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🎥 Live Streaming Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and monitor live streams for barangay events and meetings
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Streaming Server</div>
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Now</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Viewers</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recordings</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Setup Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📺 How to Start Streaming
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">1</span>
              <span className="font-medium text-blue-900">Create Stream</span>
            </div>
            <p className="text-blue-700 ml-8">
              Click "Create New Stream" and fill in the details like title, description, and schedule.
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">2</span>
              <span className="font-medium text-blue-900">Setup OBS/Camera</span>
            </div>
            <p className="text-blue-700 ml-8">
              Use the provided RTMP URL and stream key in your streaming software (OBS, camera, etc.).
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">3</span>
              <span className="font-medium text-blue-900">Go Live</span>
            </div>
            <p className="text-blue-700 ml-8">
              Start streaming from your software and monitor viewers and chat from the dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Stream Management Component */}
      <StreamManagement />

      {/* Technical Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚙️ Technical Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Streaming Endpoints</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">RTMP Server:</span>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">rtmp://localhost:1935/live</code>
              </div>
              <div>
                <span className="text-gray-600">HLS Playback:</span>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">http://localhost:8000/hls/</code>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommended Settings</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Video:</span>
                <span className="ml-2">1920x1080, 30fps, 2500kbps</span>
              </div>
              <div>
                <span className="text-gray-600">Audio:</span>
                <span className="ml-2">48kHz, 128kbps, AAC</span>
              </div>
              <div>
                <span className="text-gray-600">Keyframe:</span>
                <span className="ml-2">2 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🆘 Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">OBS Studio Setup</h4>
            <p className="text-gray-600 mb-2">
              Free streaming software for professional broadcasts.
            </p>
            <a 
              href="https://obsproject.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Download OBS →
            </a>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mobile Streaming</h4>
            <p className="text-gray-600 mb-2">
              Stream directly from your phone using RTMP apps.
            </p>
            <span className="text-gray-500">
              Search "RTMP Camera" in app stores
            </span>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Technical Support</h4>
            <p className="text-gray-600 mb-2">
              Having issues with streaming setup?
            </p>
            <a 
              href="/contact" 
              className="text-blue-600 hover:text-blue-800"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
