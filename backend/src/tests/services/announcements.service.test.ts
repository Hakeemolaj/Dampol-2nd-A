// Test suite for AnnouncementsService
import { AnnouncementsService } from '@/services/database/announcements.service';
import {
  mockSupabaseClient,
  setupMockDatabaseSuccess,
  setupMockDatabaseError,
  resetAllMocks,
  mockAnnouncement,
} from '../setup/supabase-mock';

// Mock the Supabase config
jest.mock('@/config/supabase', () => ({
  supabaseAdmin: mockSupabaseClient,
}));

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  beforeEach(() => {
    resetAllMocks();
    service = new AnnouncementsService(mockSupabaseClient);
  });

  describe('getAll', () => {
    it('should return paginated announcements', async () => {
      const mockData = [mockAnnouncement];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should apply filters correctly', async () => {
      const mockData = [mockAnnouncement];
      setupMockDatabaseSuccess(mockData);

      await service.getAll(
        { page: 1, limit: 10 },
        { category: 'Test', priority: 'normal' }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('announcements');
    });

    it('should handle database errors', async () => {
      setupMockDatabaseError('Database connection failed');

      await expect(service.getAll()).rejects.toThrow('Failed to get announcements');
    });
  });

  describe('getPublished', () => {
    it('should return only published announcements', async () => {
      const mockData = [{ ...mockAnnouncement, is_published: true }];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getPublished();

      expect(result.data).toEqual(mockData);
    });
  });

  describe('getUrgent', () => {
    it('should return urgent announcements', async () => {
      const mockData = [{ ...mockAnnouncement, priority: 'urgent' }];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getUrgent();

      expect(result).toEqual(mockData);
    });
  });

  describe('getById', () => {
    it('should return announcement by ID', async () => {
      setupMockDatabaseSuccess(mockAnnouncement);

      const result = await service.getById('test-id');

      expect(result).toEqual(mockAnnouncement);
    });

    it('should return null for non-existent announcement', async () => {
      setupMockDatabaseError('PGRST116'); // Not found error code

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new announcement', async () => {
      const createData = {
        title: 'New Announcement',
        content: 'New content',
        category: 'Test',
        author_id: 'author-id',
      };

      setupMockDatabaseSuccess({ ...mockAnnouncement, ...createData });

      const result = await service.create(createData);

      expect(result.title).toBe(createData.title);
      expect(result.content).toBe(createData.content);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: 'Test',
        // Missing required fields
      };

      await expect(service.create(invalidData as any)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should handle creation errors', async () => {
      const createData = {
        title: 'New Announcement',
        content: 'New content',
        category: 'Test',
        author_id: 'author-id',
      };

      setupMockDatabaseError('Creation failed');

      await expect(service.create(createData)).rejects.toThrow(
        'Failed to create announcement'
      );
    });
  });

  describe('update', () => {
    it('should update announcement', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      setupMockDatabaseSuccess({ ...mockAnnouncement, ...updateData });

      const result = await service.update('test-id', updateData);

      expect(result.title).toBe(updateData.title);
      expect(result.content).toBe(updateData.content);
    });

    it('should handle update errors', async () => {
      setupMockDatabaseError('Update failed');

      await expect(service.update('test-id', { title: 'New Title' })).rejects.toThrow(
        'Failed to update announcement'
      );
    });
  });

  describe('delete', () => {
    it('should delete announcement', async () => {
      setupMockDatabaseSuccess(null);

      await expect(service.delete('test-id')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      setupMockDatabaseError('Deletion failed');

      await expect(service.delete('test-id')).rejects.toThrow(
        'Failed to delete announcement'
      );
    });
  });

  describe('publish', () => {
    it('should publish announcement', async () => {
      const publishedAnnouncement = {
        ...mockAnnouncement,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      setupMockDatabaseSuccess(publishedAnnouncement);

      const result = await service.publish('test-id');

      expect(result.is_published).toBe(true);
      expect(result.published_at).toBeDefined();
    });
  });

  describe('unpublish', () => {
    it('should unpublish announcement', async () => {
      const unpublishedAnnouncement = {
        ...mockAnnouncement,
        is_published: false,
      };

      setupMockDatabaseSuccess(unpublishedAnnouncement);

      const result = await service.unpublish('test-id');

      expect(result.is_published).toBe(false);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockData = [
        { category: 'Health' },
        { category: 'Meeting' },
        { category: 'Health' }, // Duplicate
      ];

      setupMockDatabaseSuccess(mockData);

      const result = await service.getCategories();

      expect(result).toEqual(['Health', 'Meeting']);
    });
  });

  describe('getStats', () => {
    it('should return announcement statistics', async () => {
      // Mock multiple database calls for stats
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 10 }),
      }));

      const result = await service.getStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('published');
      expect(result).toHaveProperty('draft');
      expect(result).toHaveProperty('urgent');
    });
  });
});
