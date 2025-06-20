import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/config/supabase';
import { CustomError, catchAsync } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    [key: string]: any;
  };
}

export const authenticate = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new CustomError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 3) Check if user still exists
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(
      decoded.id
    );

    if (error || !user) {
      return next(
        new CustomError('The user belonging to this token does no longer exist.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    // This would be implemented based on your user schema

    // 5) Grant access to protected route
    req.user = {
      id: user.user.id,
      email: user.user.email!,
      ...user.user.user_metadata,
    };
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(
        new CustomError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const optionalAuth = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(
          decoded.id
        );

        if (!error && user) {
          req.user = {
            id: user.user.id,
            email: user.user.email!,
            ...user.user.user_metadata,
          };
        }
      } catch (error) {
        // Token is invalid, but we continue without user
      }
    }

    next();
  }
);
