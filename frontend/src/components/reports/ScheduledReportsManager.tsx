'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  Play, 
  Trash2, 
  Plus,
  FileText,
  Mail,
  Settings
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  format: string;
  frequency: string;
  schedule_time: string;
  schedule_day?: number;
  schedule_weekday?: number;
  recipients: string[];
  is_active: boolean;
  created_at: string;
  last_run?: string;
  next_run?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  formats: string[];
}

export default function ScheduledReportsManager() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: '',
    format: 'pdf',
    frequency: 'monthly',
    schedule_time: '09:00',
    schedule_day: 1,
    schedule_weekday: 1,
    recipients: [''],
    is_active: true,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/scheduled`);
      const data = await response.json();
      if (data.status === 'success') {
        setReports(data.data.reports);
      }
    } catch (err) {
      setError('Failed to fetch scheduled reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/templates`);
      const data = await response.json();
      if (data.status === 'success') {
        setTemplates(data.data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/reports/scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients.filter(email => email.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setReports([...reports, data.data.report]);
        setShowCreateForm(false);
        resetForm();
      } else {
        setError(data.message || 'Failed to create scheduled report');
      }
    } catch (err) {
      setError('Failed to create scheduled report');
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    try {
      const response = await fetch(`${API_BASE}/reports/scheduled/${editingReport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients.filter(email => email.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setReports(reports.map(r => r.id === editingReport.id ? data.data.report : r));
        setEditingReport(null);
        resetForm();
      } else {
        setError(data.message || 'Failed to update scheduled report');
      }
    } catch (err) {
      setError('Failed to update scheduled report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;

    try {
      const response = await fetch(`${API_BASE}/reports/scheduled/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'success') {
        setReports(reports.filter(r => r.id !== id));
      } else {
        setError(data.message || 'Failed to delete scheduled report');
      }
    } catch (err) {
      setError('Failed to delete scheduled report');
    }
  };

  const handleExecuteReport = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/reports/scheduled/${id}/execute`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Report execution started successfully!');
      } else {
        setError(data.message || 'Failed to execute report');
      }
    } catch (err) {
      setError('Failed to execute report');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      report_type: '',
      format: 'pdf',
      frequency: 'monthly',
      schedule_time: '09:00',
      schedule_day: 1,
      schedule_weekday: 1,
      recipients: [''],
      is_active: true,
    });
  };

  const startEdit = (report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description || '',
      report_type: report.report_type,
      format: report.format,
      frequency: report.frequency,
      schedule_time: report.schedule_time,
      schedule_day: report.schedule_day || 1,
      schedule_weekday: report.schedule_weekday || 1,
      recipients: report.recipients.length > 0 ? report.recipients : [''],
      is_active: report.is_active,
    });
    setShowCreateForm(true);
  };

  const addRecipient = () => {
    setFormData({
      ...formData,
      recipients: [...formData.recipients, ''],
    });
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    setFormData({
      ...formData,
      recipients: newRecipients,
    });
  };

  const removeRecipient = (index: number) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter((_, i) => i !== index),
    });
  };

  const getFrequencyDisplay = (frequency: string) => {
    const displays = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return displays[frequency as keyof typeof displays] || frequency;
  };

  const getStatusBadge = (report: ScheduledReport) => {
    if (!report.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const nextRun = report.next_run ? new Date(report.next_run) : null;
    const now = new Date();
    
    if (nextRun && nextRun <= now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduled reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Reports</h2>
          <p className="text-gray-600">Manage automated report generation and distribution</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingReport(null);
            resetForm();
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule New Report
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReport ? 'Edit Scheduled Report' : 'Create New Scheduled Report'}
            </CardTitle>
            <CardDescription>
              Configure automated report generation and distribution settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingReport ? handleUpdateReport : handleCreateReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Monthly Demographics Report"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type *</Label>
                  <Select
                    value={formData.report_type}
                    onValueChange={(value) => setFormData({ ...formData, report_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the report purpose..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule_time">Time *</Label>
                  <Input
                    id="schedule_time"
                    type="time"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {(formData.frequency === 'weekly' || formData.frequency === 'monthly' || 
                formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="schedule_weekday">Day of Week</Label>
                      <Select
                        value={formData.schedule_weekday.toString()}
                        onValueChange={(value) => setFormData({ ...formData, schedule_weekday: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(formData.frequency === 'monthly' || formData.frequency === 'quarterly' || 
                    formData.frequency === 'yearly') && (
                    <div className="space-y-2">
                      <Label htmlFor="schedule_day">Day of Month</Label>
                      <Input
                        id="schedule_day"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.schedule_day}
                        onChange={(e) => setFormData({ ...formData, schedule_day: parseInt(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <Label>Recipients *</Label>
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1"
                    />
                    {formData.recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipient
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingReport(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReport ? 'Update Report' : 'Create Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
              <p className="text-gray-600 mb-4">
                Create your first scheduled report to automate data generation and distribution.
              </p>
              <Button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingReport(null);
                  resetForm();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      {getStatusBadge(report)}
                    </div>
                    
                    {report.description && (
                      <p className="text-gray-600 mb-3">{report.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium capitalize">{report.report_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <p className="font-medium uppercase">{report.format}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <p className="font-medium">{getFrequencyDisplay(report.frequency)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <p className="font-medium">{report.schedule_time}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                      </div>
                      {report.next_run && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Next: {new Date(report.next_run).toLocaleDateString()}
                        </div>
                      )}
                      {report.last_run && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Last: {new Date(report.last_run).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteReport(report.id)}
                      title="Execute now"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(report)}
                      title="Edit report"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
