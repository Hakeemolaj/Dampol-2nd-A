// Mock Supabase client for testing
// This file provides mock implementations of Supabase methods for unit testing

import { jest } from '@jest/globals';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'Test',
    last_name: 'User',
  },
  created_at: '2025-01-01T00:00:00Z',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000, // 1 hour from now
  user: mockUser,
};

export const mockProfile = {
  id: 'test-user-id',
  first_name: 'Test',
  last_name: 'User',
  middle_name: null,
  phone: '+639123456789',
  role: 'resident',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockResident = {
  id: 'test-resident-id',
  user_id: 'test-user-id',
  resident_id: 'RES-000001',
  household_id: 'test-household-id',
  relationship_to_head: 'Head',
  is_registered_voter: true,
  status: 'Active',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockAnnouncement = {
  id: 'test-announcement-id',
  title: 'Test Announcement',
  summary: 'Test summary',
  content: 'Test content',
  category: 'Test',
  priority: 'normal',
  is_published: true,
  published_at: '2025-01-01T00:00:00Z',
  author_id: 'test-admin-id',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

// Mock Supabase auth methods
export const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  verifyOtp: jest.fn(),
  resend: jest.fn(),
  updateUser: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  })),
  admin: {
    getUserById: jest.fn(),
    updateUserById: jest.fn(),
    deleteUser: jest.fn(),
  },
};

// Mock Supabase database methods
export const mockSupabaseFrom = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  and: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
};

// Mock Supabase client
export const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: jest.fn(() => mockSupabaseFrom),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

// Helper functions for setting up mock responses
export const setupMockAuthSuccess = () => {
  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  });

  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  });

  mockSupabaseAuth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });

  mockSupabaseAuth.admin.getUserById.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
};

export const setupMockAuthError = (message = 'Authentication failed') => {
  const error = { message, status: 401 };

  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error,
  });

  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error,
  });

  mockSupabaseAuth.getUser.mockResolvedValue({
    data: { user: null },
    error,
  });
};

export const setupMockDatabaseSuccess = (data: any) => {
  mockSupabaseFrom.single.mockResolvedValue({
    data,
    error: null,
  });

  // For queries that return arrays
  mockSupabaseFrom.select.mockResolvedValue({
    data: Array.isArray(data) ? data : [data],
    error: null,
    count: Array.isArray(data) ? data.length : 1,
  });

  mockSupabaseFrom.insert.mockResolvedValue({
    data,
    error: null,
  });

  mockSupabaseFrom.update.mockResolvedValue({
    data,
    error: null,
  });

  mockSupabaseFrom.delete.mockResolvedValue({
    data: null,
    error: null,
  });
};

export const setupMockDatabaseError = (message = 'Database error') => {
  const error = { message, code: 'PGRST000' };

  mockSupabaseFrom.single.mockResolvedValue({
    data: null,
    error,
  });

  mockSupabaseFrom.select.mockResolvedValue({
    data: null,
    error,
    count: null,
  });

  mockSupabaseFrom.insert.mockResolvedValue({
    data: null,
    error,
  });

  mockSupabaseFrom.update.mockResolvedValue({
    data: null,
    error,
  });

  mockSupabaseFrom.delete.mockResolvedValue({
    data: null,
    error,
  });
};

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  
  // Reset mock implementations
  Object.values(mockSupabaseAuth).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockReset();
    }
  });

  Object.values(mockSupabaseFrom).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockReset().mockReturnThis();
    }
  });

  // Re-setup chainable methods
  mockSupabaseFrom.select.mockReturnThis();
  mockSupabaseFrom.insert.mockReturnThis();
  mockSupabaseFrom.update.mockReturnThis();
  mockSupabaseFrom.delete.mockReturnThis();
  mockSupabaseFrom.eq.mockReturnThis();
  mockSupabaseFrom.order.mockReturnThis();
  mockSupabaseFrom.limit.mockReturnThis();
  mockSupabaseFrom.range.mockReturnThis();
};

// Mock the Supabase module
export const mockSupabase = () => {
  jest.mock('@/config/supabase', () => ({
    supabase: mockSupabaseClient,
    supabaseAdmin: mockSupabaseClient,
    supabaseConfig: {
      isConfigured: true,
      url: 'https://test.supabase.co',
      hasValidUrl: true,
    },
  }));
};

export default {
  mockSupabaseClient,
  mockSupabaseAuth,
  mockSupabaseFrom,
  setupMockAuthSuccess,
  setupMockAuthError,
  setupMockDatabaseSuccess,
  setupMockDatabaseError,
  resetAllMocks,
  mockSupabase,
  mockUser,
  mockSession,
  mockProfile,
  mockResident,
  mockAnnouncement,
};
