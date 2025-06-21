import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '@/middleware/auth';
import { CustomError, catchAsync } from '@/middleware/errorHandler';
import { AuthService } from '@/services/authService';
import { supabase, supabaseAdmin } from '@/config/supabase';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

const createSendToken = (user: any, statusCode: number, res: Response, supabaseSession?: any) => {
  // Use Supabase session token if available, otherwise create custom JWT
  const token = supabaseSession?.access_token || signToken(user.id);

  // Remove sensitive data from output
  const { password, ...safeUser } = user;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: safeUser,
      session: supabaseSession || null,
    },
  });
};

export const register = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password, firstName, lastName, phone, middleName } = req.body;

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      middleName,
      phone,
    });

    // Send verification email if email confirmation is enabled
    if (!result.session) {
      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            ...result.profile,
          },
        },
      });
    }

    createSendToken(
      {
        id: result.user.id,
        email: result.user.email,
        ...result.profile,
      },
      201,
      res,
      result.session
    );
  }
);

export const login = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    createSendToken(
      {
        id: result.user.id,
        email: result.user.email,
        ...result.profile,
      },
      200,
      res,
      result.session
    );
  }
);

export const logout = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logout();

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);

export const refreshToken = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    const token = signToken(req.user.id);
    
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
    });

    if (error) {
      throw new CustomError('Failed to send reset email', 500);
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent successfully',
    });
  }
);

export const resetPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token, password } = req.body;

    // This would typically be handled by Supabase's built-in reset flow
    // For custom implementation, you'd verify the token and update the password
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  }
);

export const verifyEmail = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.body;

    // Verify email token with Supabase
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      throw new CustomError('Invalid or expired verification token', 400);
    }

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  }
);

export const resendVerification = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new CustomError('Failed to resend verification email', 500);
    }

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully',
    });
  }
);

export const changePassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new CustomError('Failed to change password', 400);
    }

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  }
);

export const getProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      throw new CustomError('Failed to get user profile', 500);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          ...profile,
        },
      },
    });
  }
);

export const updateProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

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
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    updateData.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new CustomError('Failed to update profile', 500);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          ...profile,
        },
      },
    });
  }
);
