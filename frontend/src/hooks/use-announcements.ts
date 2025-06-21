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

      const response = await announcementsApi.getAll({
        category: memoizedOptions.category,
        priority: memoizedOptions.priority,
        limit: memoizedOptions.limit,
        offset: memoizedOptions.offset,
      });

      setAnnouncements(response.data.announcements);
      setPagination(response.data.pagination);
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

      const response = await announcementsApi.getById(id);
      setAnnouncement(response.data.announcement);
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

      const response = await announcementsApi.getUrgent();
      setUrgentAnnouncements(response.data.announcements);
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

      const response = await announcementsApi.getCategories();
      setCategories(response.data.categories);
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
