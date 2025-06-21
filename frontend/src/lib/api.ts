const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const API_VERSION = 'v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, 'Network error or server unavailable');
  }
}

// Announcements API
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  priority: 'normal' | 'urgent';
  isPublished: boolean;
  publishedAt: string;
  expiresAt: string | null;
  createdAt: string;
  author: string;
}

export interface AnnouncementsResponse {
  status: string;
  data: {
    announcements: Announcement[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface AnnouncementResponse {
  status: string;
  data: {
    announcement: Announcement;
  };
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: string[];
  };
}

export const announcementsApi = {
  // Get all announcements with optional filters
  getAll: async (params?: {
    category?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<AnnouncementsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    const endpoint = `/announcements${query ? `?${query}` : ''}`;
    
    return apiRequest<AnnouncementsResponse>(endpoint);
  },

  // Get announcement by ID
  getById: async (id: string): Promise<AnnouncementResponse> => {
    return apiRequest<AnnouncementResponse>(`/announcements/${id}`);
  },

  // Get urgent announcements
  getUrgent: async (): Promise<AnnouncementsResponse> => {
    return apiRequest<AnnouncementsResponse>('/announcements/urgent');
  },

  // Get available categories
  getCategories: async (): Promise<CategoriesResponse> => {
    return apiRequest<CategoriesResponse>('/announcements/categories');
  },
};

// Health check API
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    const url = `${API_BASE_URL}/health`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Health check failed');
    }
    
    return await response.json();
  },
};

// Test API
export interface TestResponse {
  status: string;
  message: string;
  timestamp: string;
}

export const testApi = {
  ping: async (): Promise<TestResponse> => {
    return apiRequest<TestResponse>('/test');
  },
};

// Export the ApiError and apiRequest for error handling and general use
export { ApiError, apiRequest };
