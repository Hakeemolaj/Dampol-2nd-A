import { supabaseAdmin } from '@/config/supabase';
import { BaseService } from './database/base.service';

export interface UserRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  position?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  role: string;
  permissions: string[];
  description: string;
  level: number; // Higher number = more permissions
}

export class RoleManagementService extends BaseService {
  private readonly tableName = 'user_profiles';

  // Define role hierarchy and permissions
  private readonly roleHierarchy: RolePermission[] = [
    {
      role: 'admin',
      permissions: ['*'], // All permissions
      description: 'System Administrator - Full access to all features',
      level: 100,
    },
    {
      role: 'barangay_captain',
      permissions: [
        'view_all_data',
        'manage_announcements',
        'manage_documents',
        'manage_residents',
        'manage_finances',
        'manage_staff',
        'view_analytics',
        'manage_incidents',
        'approve_documents',
        'manage_events',
      ],
      description: 'Barangay Captain - Highest elected official with executive powers',
      level: 90,
    },
    {
      role: 'barangay_secretary',
      permissions: [
        'manage_documents',
        'manage_residents',
        'view_analytics',
        'manage_announcements',
        'process_documents',
        'manage_records',
        'view_finances',
      ],
      description: 'Barangay Secretary - Records management and documentation',
      level: 80,
    },
    {
      role: 'barangay_treasurer',
      permissions: [
        'manage_finances',
        'view_analytics',
        'process_payments',
        'generate_financial_reports',
        'manage_budget',
        'view_documents',
      ],
      description: 'Barangay Treasurer - Financial management and accounting',
      level: 75,
    },
    {
      role: 'barangay_councilor',
      permissions: [
        'view_analytics',
        'manage_announcements',
        'view_documents',
        'view_residents',
        'view_finances',
        'manage_incidents',
        'participate_sessions',
      ],
      description: 'Barangay Councilor - Legislative and oversight functions',
      level: 70,
    },
    {
      role: 'sk_chairman',
      permissions: [
        'manage_youth_programs',
        'view_analytics',
        'manage_announcements',
        'view_residents',
        'manage_youth_events',
        'view_documents',
      ],
      description: 'Sangguniang Kabataan Chairman - Youth affairs and programs',
      level: 65,
    },
    {
      role: 'staff',
      permissions: [
        'process_documents',
        'view_residents',
        'manage_appointments',
        'basic_analytics',
        'customer_service',
      ],
      description: 'Barangay Staff - Administrative and clerical support',
      level: 50,
    },
    {
      role: 'resident',
      permissions: [
        'view_announcements',
        'request_documents',
        'view_own_profile',
        'submit_feedback',
        'view_services',
      ],
      description: 'Barangay Resident - Basic citizen services access',
      level: 10,
    },
  ];

  /**
   * Get all users with their roles
   */
  async getAllUsersWithRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get all users with roles');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    role: string,
    position?: string,
    department?: string
  ): Promise<UserRole> {
    try {
      // Validate role
      if (!this.isValidRole(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      const updateData = {
        role,
        position,
        department,
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      return await this.executeQuery<UserRole>(query, 'update user role');
    } catch (error) {
      this.handleError(error, 'update user role');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<UserRole[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get users by role');
    }
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: string): string[] {
    const roleData = this.roleHierarchy.find(r => r.role === role);
    return roleData?.permissions || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(userRole: string, permission: string): boolean {
    const roleData = this.roleHierarchy.find(r => r.role === userRole);
    
    if (!roleData) {
      return false;
    }

    // Admin has all permissions
    if (roleData.permissions.includes('*')) {
      return true;
    }

    return roleData.permissions.includes(permission);
  }

  /**
   * Check if user can perform action on target user
   */
  canManageUser(managerRole: string, targetRole: string): boolean {
    const managerData = this.roleHierarchy.find(r => r.role === managerRole);
    const targetData = this.roleHierarchy.find(r => r.role === targetRole);

    if (!managerData || !targetData) {
      return false;
    }

    // Admin can manage everyone
    if (managerData.permissions.includes('*')) {
      return true;
    }

    // Can only manage users with lower level
    return managerData.level > targetData.level;
  }

  /**
   * Get available roles for assignment
   */
  getAvailableRoles(assignerRole: string): RolePermission[] {
    const assignerData = this.roleHierarchy.find(r => r.role === assignerRole);
    
    if (!assignerData) {
      return [];
    }

    // Admin can assign any role
    if (assignerData.permissions.includes('*')) {
      return this.roleHierarchy;
    }

    // Can only assign roles with lower or equal level
    return this.roleHierarchy.filter(role => role.level <= assignerData.level);
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy(): RolePermission[] {
    return this.roleHierarchy;
  }

  /**
   * Validate role
   */
  private isValidRole(role: string): boolean {
    return this.roleHierarchy.some(r => r.role === role);
  }

  /**
   * Get barangay officials (elected positions)
   */
  async getBarangayOfficials(): Promise<UserRole[]> {
    try {
      const officialRoles = [
        'barangay_captain',
        'barangay_secretary',
        'barangay_treasurer',
        'barangay_councilor',
        'sk_chairman',
      ];

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .in('role', officialRoles)
        .order('role', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get barangay officials');
    }
  }

  /**
   * Get staff members
   */
  async getStaffMembers(): Promise<UserRole[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get staff members');
    }
  }

  /**
   * Create audit log for role changes
   */
  async logRoleChange(
    changedBy: string,
    targetUserId: string,
    oldRole: string,
    newRole: string,
    reason?: string
  ): Promise<void> {
    try {
      const auditData = {
        id: this.generateId(),
        user_id: changedBy,
        action: 'role_change',
        entity_type: 'user_profile',
        entity_id: targetUserId,
        old_values: { role: oldRole },
        new_values: { role: newRole },
        metadata: {
          reason: reason || 'Role updated by administrator',
          timestamp: this.getCurrentTimestamp(),
        },
        created_at: this.getCurrentTimestamp(),
      };

      await this.client
        .from('audit_logs')
        .insert(auditData);
    } catch (error) {
      console.error('Failed to log role change:', error);
      // Don't throw error here as it's just logging
    }
  }

  /**
   * Bulk role assignment
   */
  async bulkUpdateRoles(
    updates: Array<{
      userId: string;
      role: string;
      position?: string;
      department?: string;
    }>,
    changedBy: string
  ): Promise<UserRole[]> {
    try {
      const results: UserRole[] = [];

      for (const update of updates) {
        // Get current role for audit log
        const currentUser = await this.client
          .from(this.tableName)
          .select('role')
          .eq('id', update.userId)
          .single();

        // Update role
        const updatedUser = await this.updateUserRole(
          update.userId,
          update.role,
          update.position,
          update.department
        );

        results.push(updatedUser);

        // Log the change
        if (currentUser.data) {
          await this.logRoleChange(
            changedBy,
            update.userId,
            currentUser.data.role,
            update.role,
            'Bulk role update'
          );
        }
      }

      return results;
    } catch (error) {
      this.handleError(error, 'bulk update roles');
    }
  }
}

export const roleManagementService = new RoleManagementService();
