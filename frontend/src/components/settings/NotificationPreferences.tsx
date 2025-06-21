'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useSupabase';

interface NotificationPreferences {
  stream_notifications: boolean;
  emergency_alerts: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  announcement_notifications: boolean;
  document_status_notifications: boolean;
  meeting_reminders: boolean;
  event_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    stream_notifications: true,
    emergency_alerts: true,
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    announcement_notifications: true,
    document_status_notifications: true,
    meeting_reminders: true,
    event_notifications: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/notification-preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/users/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save notification preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, push_notifications: true }));
        setMessage({ type: 'success', text: 'Push notifications enabled!' });
      } else {
        setMessage({ type: 'error', text: 'Push notification permission denied.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <BellIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
            <p className="text-sm text-gray-600">Manage how you receive notifications from the barangay</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stream & Live Content */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-blue-600" />
            Live Streams & Events
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Stream Notifications</label>
                <p className="text-xs text-gray-500">Get notified about upcoming and live streams</p>
              </div>
              <button
                onClick={() => handleToggle('stream_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.stream_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.stream_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Meeting Reminders</label>
                <p className="text-xs text-gray-500">Reminders for barangay assembly meetings</p>
              </div>
              <button
                onClick={() => handleToggle('meeting_reminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.meeting_reminders ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.meeting_reminders ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Event Notifications</label>
                <p className="text-xs text-gray-500">Community events and celebrations</p>
              </div>
              <button
                onClick={() => handleToggle('event_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.event_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.event_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Emergency & Important */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            Emergency & Important
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Emergency Alerts</label>
                <p className="text-xs text-gray-500">Critical emergency broadcasts and alerts</p>
              </div>
              <button
                onClick={() => handleToggle('emergency_alerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emergency_alerts ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emergency_alerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Announcements</label>
                <p className="text-xs text-gray-500">General barangay announcements</p>
              </div>
              <button
                onClick={() => handleToggle('announcement_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.announcement_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.announcement_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Document Status Updates</label>
                <p className="text-xs text-gray-500">Updates on your document requests</p>
              </div>
              <button
                onClick={() => handleToggle('document_status_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.document_status_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.document_status_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <SpeakerWaveIcon className="h-5 w-5 text-green-600" />
            Delivery Methods
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-xs text-gray-500">Browser notifications</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!('Notification' in window) || Notification.permission === 'denied' ? (
                  <span className="text-xs text-red-600">Not supported</span>
                ) : Notification.permission === 'default' ? (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Enable
                  </button>
                ) : null}
                <button
                  onClick={() => handleToggle('push_notifications')}
                  disabled={!('Notification' in window) || Notification.permission === 'denied'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.push_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  } ${!('Notification' in window) || Notification.permission === 'denied' ? 'opacity-50' : ''}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-xs text-gray-500">Notifications via email</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-xs text-gray-500">Text message alerts</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sms_notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Quiet Hours</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Quiet Hours</label>
                <p className="text-xs text-gray-500">Pause non-emergency notifications during these hours</p>
              </div>
              <button
                onClick={() => handleToggle('quiet_hours_enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.quiet_hours_enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
