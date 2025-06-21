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

    try {
      // 2) Verify Supabase JWT token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return next(
          new CustomError('Invalid or expired token. Please log in again.', 401)
        );
      }

      // 3) Get user profile for additional information
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 4) Grant access to protected route
      req.user = {
        id: user.id,
        email: user.email!,
        role: profile?.role || 'resident',
        ...user.user_metadata,
        profile: profile || null,
      };

      next();
    } catch (jwtError) {
      // Fallback to custom JWT verification for backward compatibility
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Check if user still exists in Supabase
        const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(
          decoded.id
        );

        if (error || !user) {
          return next(
            new CustomError('The user belonging to this token does no longer exist.', 401)
          );
        }

        // Get user profile
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', user.user.id)
          .single();

        req.user = {
          id: user.user.id,
          email: user.user.email!,
          role: profile?.role || 'resident',
          ...user.user.user_metadata,
          profile: profile || null,
        };

        next();
      } catch (error) {
        return next(
          new CustomError('Invalid token. Please log in again.', 401)
        );
      }
    }
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

// Enhanced role-based middleware for barangay positions
export const requireBarangayOfficial = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const officialRoles = [
    'admin',
    'barangay_captain',
    'barangay_secretary',
    'barangay_treasurer',
    'barangay_councilor',
    'sk_chairman'
  ];

  if (!req.user?.role || !officialRoles.includes(req.user.role)) {
    return next(
      new CustomError('Barangay official access required', 403)
    );
  }
  next();
};

export const requireBarangayCaptain = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role || !['admin', 'barangay_captain'].includes(req.user.role)) {
    return next(
      new CustomError('Barangay Captain access required', 403)
    );
  }
  next();
};

export const requireFinancialAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const financialRoles = [
    'admin',
    'barangay_captain',
    'barangay_treasurer'
  ];

  if (!req.user?.role || !financialRoles.includes(req.user.role)) {
    return next(
      new CustomError('Financial access required', 403)
    );
  }
  next();
};

export const requireDocumentAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const documentRoles = [
    'admin',
    'barangay_captain',
    'barangay_secretary',
    'staff'
  ];

  if (!req.user?.role || !documentRoles.includes(req.user.role)) {
    return next(
      new CustomError('Document processing access required', 403)
    );
  }
  next();
};

// Middleware to check if user is admin
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role || req.user.role !== 'admin') {
    return next(
      new CustomError('Admin access required', 403)
    );
  }
  next();
};

// Middleware to check if user is staff or admin
export const requireStaff = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role || !['admin', 'staff'].includes(req.user.role)) {
    return next(
      new CustomError('Staff or admin access required', 403)
    );
  }
  next();
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
        // Try Supabase JWT verification first
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (!error && user) {
          // Get user profile
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          req.user = {
            id: user.id,
            email: user.email!,
            role: profile?.role || 'resident',
            ...user.user_metadata,
            profile: profile || null,
          };
        }
      } catch (supabaseError) {
        // Fallback to custom JWT
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(
            decoded.id
          );

          if (!error && user) {
            const { data: profile } = await supabaseAdmin
              .from('user_profiles')
              .select('*')
              .eq('id', user.user.id)
              .single();

            req.user = {
              id: user.user.id,
              email: user.user.email!,
              role: profile?.role || 'resident',
              ...user.user.user_metadata,
              profile: profile || null,
            };
          }
        } catch (error) {
          // Token is invalid, but we continue without user
        }
      }
    }

    next();
  }
);
