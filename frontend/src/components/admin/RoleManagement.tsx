'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Crown,
  FileText,
  Calculator,
  Gavel,
  UserCheck,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  position?: string;
  department?: string;
  created_at: string;
}

interface Role {
  role: string;
  permissions: string[];
  description: string;
  level: number;
}

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    position: '',
    department: '',
    reason: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users`);
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/roles`);
      const data = await response.json();
      if (data.status === 'success') {
        setRoles(data.data.roles);
      }
    } catch (err) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...editForm } : user
        ));
        setEditingUser(null);
        setEditForm({ role: '', position: '', department: '', reason: '' });
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      role: user.role,
      position: user.position || '',
      department: user.department || '',
      reason: '',
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ role: '', position: '', department: '', reason: '' });
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: <Settings className="w-4 h-4" />,
      barangay_captain: <Crown className="w-4 h-4" />,
      barangay_secretary: <FileText className="w-4 h-4" />,
      barangay_treasurer: <Calculator className="w-4 h-4" />,
      barangay_councilor: <Gavel className="w-4 h-4" />,
      sk_chairman: <UserCheck className="w-4 h-4" />,
      staff: <Users className="w-4 h-4" />,
      resident: <Shield className="w-4 h-4" />,
    };
    return icons[role as keyof typeof icons] || <Users className="w-4 h-4" />;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      barangay_captain: 'bg-purple-100 text-purple-800',
      barangay_secretary: 'bg-blue-100 text-blue-800',
      barangay_treasurer: 'bg-green-100 text-green-800',
      barangay_councilor: 'bg-yellow-100 text-yellow-800',
      sk_chairman: 'bg-orange-100 text-orange-800',
      staff: 'bg-gray-100 text-gray-800',
      resident: 'bg-slate-100 text-slate-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage user roles and permissions for barangay positions</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Role Hierarchy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Hierarchy & Permissions
          </CardTitle>
          <CardDescription>
            Overview of available roles and their permission levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <div key={role.role} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getRoleIcon(role.role)}
                  <h4 className="font-medium">{formatRoleName(role.role)}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Level {role.level}</span>
                  <Badge variant="outline" className="text-xs">
                    {role.permissions.includes('*') ? 'All' : role.permissions.length} perms
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Assign and manage roles for barangay users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.position && (
                        <p className="text-xs text-gray-500">{user.position}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {formatRoleName(user.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingUser === user.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateRole(user.id)}
                          className="flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Role
                      </Button>
                    )}
                  </div>
                </div>

                {editingUser === user.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={editForm.role}
                          onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.role} value={role.role}>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role.role)}
                                  {formatRoleName(role.role)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={editForm.position}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                          placeholder="e.g., Head of Records"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          placeholder="e.g., Administrative"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Change</Label>
                      <Textarea
                        id="reason"
                        value={editForm.reason}
                        onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                        placeholder="Explain the reason for this role change..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
