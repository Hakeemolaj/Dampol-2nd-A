// Test suite for AnnouncementsSection component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnouncementsSection from '@/components/sections/announcements-section';

// Mock global fetch and test utilities
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Create test utilities
const testUtils = {
  resetAllMocks: () => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  },
  mockFetchResponse: (data: any) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    });
  },
  mockFetchError: (error: Error) => {
    mockFetch.mockRejectedValueOnce(error);
  },
};

// Add to global for test access
(global as any).testUtils = testUtils;

// Mock the API service
jest.mock('@/services/api', () => ({
  get: jest.fn(),
}));

const mockAnnouncements = [
  {
    id: '1',
    title: 'Community Meeting - December 20, 2024',
    summary: 'Monthly barangay assembly to discuss community matters',
    content: 'Join us for our monthly community meeting...',
    category: 'Meeting',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2024-12-15T08:00:00Z',
    expiresAt: '2024-12-20T18:00:00Z',
    createdAt: '2024-12-15T08:00:00Z',
    author: 'Barangay Captain',
  },
  {
    id: '2',
    title: 'Free Medical Checkup Program',
    summary: 'Health program available for all residents',
    content: 'We are pleased to announce a free medical checkup...',
    category: 'Health',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2024-12-14T09:00:00Z',
    expiresAt: '2024-12-18T17:00:00Z',
    createdAt: '2024-12-14T09:00:00Z',
    author: 'Health Committee',
  },
  {
    id: '3',
    title: 'Road Maintenance Notice',
    summary: 'Main street repair ongoing, expect traffic delays',
    content: 'Please be advised that road maintenance work...',
    category: 'Infrastructure',
    priority: 'urgent',
    isPublished: true,
    publishedAt: '2024-12-13T06:00:00Z',
    expiresAt: '2024-12-20T18:00:00Z',
    createdAt: '2024-12-13T06:00:00Z',
    author: 'Public Works',
  },
];

describe('AnnouncementsSection', () => {
  beforeEach(() => {
    testUtils.resetAllMocks();
  });

  it('renders announcements section with title', () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    expect(screen.getByText('Latest Announcements')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    expect(screen.getByText('Loading announcements...')).toBeInTheDocument();
  });

  it('displays announcements after loading', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Community Meeting - December 20, 2024')).toBeInTheDocument();
      expect(screen.getByText('Free Medical Checkup Program')).toBeInTheDocument();
      expect(screen.getByText('Road Maintenance Notice')).toBeInTheDocument();
    });
  });

  it('displays announcement categories', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Meeting')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    });
  });

  it('highlights urgent announcements', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      const urgentAnnouncement = screen.getByText('Road Maintenance Notice').closest('.announcement-card');
      expect(urgentAnnouncement).toHaveClass('urgent');
    });
  });

  it('displays announcement summaries', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Monthly barangay assembly to discuss community matters')).toBeInTheDocument();
      expect(screen.getByText('Health program available for all residents')).toBeInTheDocument();
      expect(screen.getByText('Main street repair ongoing, expect traffic delays')).toBeInTheDocument();
    });
  });

  it('displays publication dates', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText(/December 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/December 14, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/December 13, 2024/)).toBeInTheDocument();
    });
  });

  it('handles empty announcements list', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: [],
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('No announcements available at this time.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    testUtils.mockFetchError(new Error('Network error'));

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load announcements. Please try again later.')).toBeInTheDocument();
    });
  });

  it('allows filtering by category', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      const healthFilter = screen.getByText('Health');
      fireEvent.click(healthFilter);
    });

    await waitFor(() => {
      expect(screen.getByText('Free Medical Checkup Program')).toBeInTheDocument();
      expect(screen.queryByText('Community Meeting - December 20, 2024')).not.toBeInTheDocument();
    });
  });

  it('allows filtering by priority', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      const urgentFilter = screen.getByText('Urgent');
      fireEvent.click(urgentFilter);
    });

    await waitFor(() => {
      expect(screen.getByText('Road Maintenance Notice')).toBeInTheDocument();
      expect(screen.queryByText('Community Meeting - December 20, 2024')).not.toBeInTheDocument();
    });
  });

  it('shows "View All" link when there are many announcements', async () => {
    const manyAnnouncements = Array(10).fill(null).map((_, index) => ({
      ...mockAnnouncements[0],
      id: `${index + 1}`,
      title: `Announcement ${index + 1}`,
    }));

    testUtils.mockFetchResponse({
      status: 'success',
      data: manyAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('View All Announcements')).toBeInTheDocument();
    });
  });

  it('handles click on announcement card', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      const announcementCard = screen.getByText('Community Meeting - December 20, 2024').closest('.announcement-card');
      if (announcementCard) {
        fireEvent.click(announcementCard);
      }
    });

    // Should navigate to announcement detail page
    // This would be tested with router mock
  });

  it('displays author information', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Barangay Captain')).toBeInTheDocument();
      expect(screen.getByText('Health Committee')).toBeInTheDocument();
      expect(screen.getByText('Public Works')).toBeInTheDocument();
    });
  });

  it('refreshes announcements when refresh button is clicked', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      const refreshButton = screen.getByLabelText('Refresh announcements');
      fireEvent.click(refreshButton);
    });

    // Should make another API call
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('is accessible with proper ARIA labels', async () => {
    testUtils.mockFetchResponse({
      status: 'success',
      data: mockAnnouncements,
    });

    render(<AnnouncementsSection />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Latest Announcements' })).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(3);
    });
  });
});
