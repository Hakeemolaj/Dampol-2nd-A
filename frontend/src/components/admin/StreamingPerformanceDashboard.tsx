'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  SignalIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PerformanceMetrics {
  timestamp: string;
  concurrent_viewers: number;
  cpu_usage: number;
  memory_usage: number;
  bandwidth_usage: number;
  response_time: number;
  error_rate: number;
  chat_messages_per_second: number;
  video_quality_score: number;
  buffering_events: number;
}

interface StreamHealth {
  stream_id: string;
  title: string;
  status: 'healthy' | 'warning' | 'critical';
  viewers: number;
  quality_score: number;
  latency: number;
  errors: number;
  uptime: number;
}

export default function StreamingPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [streamHealth, setStreamHealth] = useState<StreamHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchPerformanceData();
    
    const interval = setInterval(fetchPerformanceData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance metrics
      const metricsResponse = await fetch(`${API_BASE}/admin/streaming/performance?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch stream health data
      const healthResponse = await fetch(`${API_BASE}/admin/streaming/health`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (metricsResponse.ok && healthResponse.ok) {
        const metricsData = await metricsResponse.json();
        const healthData = await healthResponse.json();
        
        setMetrics(metricsData.data || []);
        setStreamHealth(healthData.data || []);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate current system status
  const currentMetrics = metrics[metrics.length - 1];
  const systemStatus = currentMetrics ? (
    currentMetrics.error_rate > 5 ? 'critical' :
    currentMetrics.cpu_usage > 80 || currentMetrics.memory_usage > 85 ? 'warning' :
    'healthy'
  ) : 'unknown';

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  if (loading && metrics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Streaming Performance</h1>
          <p className="text-gray-600">Real-time monitoring and performance metrics</p>
        </div>
        
        <div className="flex gap-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* Refresh Interval */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10s refresh</option>
            <option value={30}>30s refresh</option>
            <option value={60}>1m refresh</option>
            <option value={300}>5m refresh</option>
          </select>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              systemStatus === 'healthy' ? 'bg-green-100' :
              systemStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <ServerIcon className={`h-6 w-6 ${
                systemStatus === 'healthy' ? 'text-green-600' :
                systemStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className={`text-2xl font-bold capitalize ${
                systemStatus === 'healthy' ? 'text-green-600' :
                systemStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {systemStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Viewers</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMetrics?.concurrent_viewers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMetrics?.response_time ? `${currentMetrics.response_time.toFixed(0)}ms` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMetrics?.error_rate ? `${currentMetrics.error_rate.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewer Count Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Concurrent Viewers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [value, 'Viewers']}
              />
              <Area 
                type="monotone" 
                dataKey="concurrent_viewers" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Resources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpu_usage" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory_usage" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Memory Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time & Latency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
              />
              <Line 
                type="monotone" 
                dataKey="response_time" 
                stroke="#8B5CF6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chat Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [value, 'Messages/sec']}
              />
              <Bar 
                dataKey="chat_messages_per_second" 
                fill="#06B6D4"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stream Health Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Streams Health</h3>
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
                  Viewers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streamHealth.map((stream) => (
                <tr key={stream.stream_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {stream.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(stream.status)}`}>
                      {stream.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.viewers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{stream.quality_score}/100</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            stream.quality_score >= 80 ? 'bg-green-500' :
                            stream.quality_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stream.quality_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.latency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatUptime(stream.uptime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.errors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {streamHealth.length === 0 && (
          <div className="text-center py-12">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active streams</h3>
            <p className="mt-1 text-sm text-gray-500">
              No streams are currently running.
            </p>
          </div>
        )}
      </div>

      {/* Performance Alerts */}
      {currentMetrics && (currentMetrics.error_rate > 5 || currentMetrics.cpu_usage > 80) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Performance Alert</h3>
          </div>
          <div className="text-red-800 text-sm">
            {currentMetrics.error_rate > 5 && (
              <p>• High error rate detected: {currentMetrics.error_rate.toFixed(1)}%</p>
            )}
            {currentMetrics.cpu_usage > 80 && (
              <p>• High CPU usage: {currentMetrics.cpu_usage.toFixed(1)}%</p>
            )}
            {currentMetrics.memory_usage > 85 && (
              <p>• High memory usage: {currentMetrics.memory_usage.toFixed(1)}%</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
