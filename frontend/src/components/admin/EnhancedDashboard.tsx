'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Megaphone, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus,
  Calendar,
  Bell,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalResidents: number;
  pendingDocuments: number;
  totalAnnouncements: number;
  activeUsers: number;
}

interface QuickStats {
  documentsToday: number;
  documentsCompleted: number;
  newRegistrations: number;
  revenueToday: number;
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  id: string;
}

interface Alert {
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  action: string;
  link: string;
}

interface DashboardData {
  stats: DashboardStats;
  quickStats: QuickStats;
  recentActivity: Activity[];
  alerts: Alert[];
  lastUpdated: string;
}

export default function EnhancedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE}/admin/dashboard`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
        setError(null);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${getAlertColor(alert.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={alert.link} className="flex items-center gap-1">
                      {alert.action}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Residents</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalResidents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.pendingDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Megaphone className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalAnnouncements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Activity
          </CardTitle>
          <CardDescription>Real-time statistics for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{data.quickStats.documentsToday}</p>
              <p className="text-sm text-gray-600">Documents Submitted</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{data.quickStats.documentsCompleted}</p>
              <p className="text-sm text-gray-600">Documents Completed</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <UserPlus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{data.quickStats.newRegistrations}</p>
              <p className="text-sm text-gray-600">New Registrations</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">₱{data.quickStats.revenueToday.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Revenue Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'document_request' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'document_request' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-800 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/documents">📄 Process Documents</a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/announcements">📢 Create Announcement</a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/residents">👥 Manage Residents</a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/reports">📊 View Reports</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
