import { supabase, supabaseAdmin } from '@/config/supabase';
import { CustomError } from '@/middleware/errorHandler';
import jwt from 'jsonwebtoken';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: any;
  session: any;
  profile: any;
}

export class AuthService {
  /**
   * Register a new user with Supabase Auth and create profile
   */
  static async register(data: RegisterData): Promise<AuthResult> {
    const { email, password, firstName, lastName, middleName, phone } = data;

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName,
            phone,
          },
        },
      });

      if (authError) {
        throw new CustomError(authError.message, 400);
      }

      if (!authData.user) {
        throw new CustomError('Failed to create user', 400);
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          phone,
          role: 'resident', // Default role
        })
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new CustomError('Failed to create user profile', 400);
      }

      return {
        user: authData.user,
        session: authData.session,
        profile,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Registration failed', 500);
    }
  }

  /**
   * Login user with email and password
   */
  static async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new CustomError('Invalid email or password', 401);
      }

      if (!authData.user) {
        throw new CustomError('Login failed', 401);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new CustomError('Failed to get user profile', 500);
      }

      return {
        user: authData.user,
        session: authData.session,
        profile,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', 500);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new CustomError('Logout failed', 500);
      }
    } catch (error) {
      throw new CustomError('Logout failed', 500);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<any> {
    try {
      const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error || !user) {
        throw new CustomError('User not found', 404);
      }

      // Get user profile
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        ...user.user,
        profile,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user', 500);
    }
  }

  /**
   * Verify JWT token (Supabase or custom)
   */
  static async verifyToken(token: string): Promise<any> {
    try {
      // Try Supabase JWT verification first
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        // Get user profile
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        return {
          id: user.id,
          email: user.email,
          role: profile?.role || 'resident',
          ...user.user_metadata,
          profile: profile || null,
        };
      }

      // Fallback to custom JWT verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userData = await this.getUserById(decoded.id);
      
      return {
        id: userData.id,
        email: userData.email,
        role: userData.profile?.role || 'resident',
        ...userData.user_metadata,
        profile: userData.profile || null,
      };
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
      });

      if (error) {
        throw new CustomError('Failed to send reset email', 500);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Password reset failed', 500);
    }
  }

  /**
   * Update password
   */
  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        throw new CustomError('Failed to update password', 400);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Password update failed', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: any): Promise<any> {
    try {
      const allowedFields = [
        'first_name',
        'last_name',
        'middle_name',
        'phone',
        'date_of_birth',
        'gender',
        'civil_status',
        'occupation',
        'address',
      ];

      const updateData: any = {};
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key) && profileData[key] !== undefined) {
          updateData[key] = profileData[key];
        }
      });

      updateData.updated_at = new Date().toISOString();

      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new CustomError('Failed to update profile', 500);
      }

      return profile;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Profile update failed', 500);
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        throw new CustomError('Invalid or expired verification token', 400);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Email verification failed', 500);
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw new CustomError('Failed to resend verification email', 500);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Resend verification failed', 500);
    }
  }
}
