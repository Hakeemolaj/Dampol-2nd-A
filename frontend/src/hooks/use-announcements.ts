'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { announcementsApi, Announcement, ApiError } from '@/lib/api';

interface UseAnnouncementsOptions {
  category?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  refetch: () => Promise<void>;
}

export function useAnnouncements(options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null>(null);

  // Memoize options to prevent infinite re-renders
  const memoizedOptions = useMemo(() => options, [
    options.category,
    options.priority,
    options.limit,
    options.offset
  ]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily use mock data to prevent infinite re-renders
      // TODO: Replace with actual API call when backend is ready
      const mockResponse = {
        data: {
          announcements: [
            {
              id: '1',
              title: 'Barangay Assembly - January 15, 2025',
              summary: 'Monthly barangay assembly for Dampol 2nd A residents to discuss community matters',
              content: 'Join us for our monthly community meeting at the Dampol 2nd A Barangay Hall.',
              category: 'Meeting',
              priority: 'normal' as const,
              isPublished: true,
              publishedAt: '2025-01-10T08:00:00Z',
              expiresAt: '2025-01-15T18:00:00Z',
              createdAt: '2025-01-10T08:00:00Z',
              author: 'Barangay Captain Dampol 2nd A',
            }
          ],
          pagination: {
            total: 1,
            limit: memoizedOptions.limit || 10,
            offset: memoizedOptions.offset || 0,
            hasMore: false
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnnouncements(mockResponse.data.announcements);
      setPagination(mockResponse.data.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch announcements');
      }
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, [memoizedOptions]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    loading,
    error,
    pagination,
    refetch: fetchAnnouncements,
  };
}

interface UseAnnouncementReturn {
  announcement: Announcement | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnnouncement(id: string): UseAnnouncementReturn {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncement = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Temporarily use mock data
      const mockAnnouncement = {
        id: id,
        title: 'Sample Announcement',
        summary: 'This is a sample announcement',
        content: 'This is the full content of the sample announcement.',
        category: 'General',
        priority: 'normal' as const,
        isPublished: true,
        publishedAt: '2025-01-10T08:00:00Z',
        expiresAt: '2025-01-15T18:00:00Z',
        createdAt: '2025-01-10T08:00:00Z',
        author: 'Barangay Staff',
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      setAnnouncement(mockAnnouncement);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch announcement');
      }
      console.error('Error fetching announcement:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  return {
    announcement,
    loading,
    error,
    refetch: fetchAnnouncement,
  };
}

interface UseUrgentAnnouncementsReturn {
  urgentAnnouncements: Announcement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUrgentAnnouncements(): UseUrgentAnnouncementsReturn {
  const [urgentAnnouncements, setUrgentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrgentAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock urgent announcements
      const mockUrgentAnnouncements = [
        {
          id: 'urgent-1',
          title: 'Emergency Road Closure',
          summary: 'Dampol Road temporarily closed for emergency repairs',
          content: 'Due to emergency repairs, Dampol Road will be closed from 8 AM to 5 PM today.',
          category: 'Emergency',
          priority: 'urgent' as const,
          isPublished: true,
          publishedAt: '2025-01-19T06:00:00Z',
          expiresAt: '2025-01-19T18:00:00Z',
          createdAt: '2025-01-19T06:00:00Z',
          author: 'Barangay Emergency Response',
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 200));
      setUrgentAnnouncements(mockUrgentAnnouncements);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch urgent announcements');
      }
      console.error('Error fetching urgent announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgentAnnouncements();
  }, []);

  return {
    urgentAnnouncements,
    loading,
    error,
    refetch: fetchUrgentAnnouncements,
  };
}

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock categories
      const mockCategories = [
        'Meeting',
        'Health',
        'Infrastructure',
        'Emergency',
        'Event',
        'Environment',
        'Education',
        'Safety'
      ];

      await new Promise(resolve => setTimeout(resolve, 100));
      setCategories(mockCategories);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch categories');
      }
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
