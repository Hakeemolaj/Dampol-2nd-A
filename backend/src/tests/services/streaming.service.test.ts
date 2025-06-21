// Test suite for StreamingService
import { StreamingService } from '@/services/streamingService';
import {
  mockSupabaseClient,
  setupMockDatabaseSuccess,
  setupMockDatabaseError,
  resetAllMocks,
} from '../setup/supabase-mock';

// Mock the Supabase config
jest.mock('@/config/supabase', () => ({
  supabase: mockSupabaseClient,
  supabaseAdmin: mockSupabaseClient,
}));

const mockStream = {
  id: 'stream-123',
  title: 'Barangay Assembly Meeting',
  description: 'Monthly community meeting',
  stream_key: 'stream-key-123',
  category: 'meeting',
  status: 'scheduled',
  is_public: true,
  recording_enabled: true,
  scheduled_at: new Date().toISOString(),
  viewer_count: 0,
  peak_viewer_count: 0,
  final_viewer_count: 0,
  created_by: 'admin-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockViewer = {
  id: 'viewer-123',
  stream_id: 'stream-123',
  user_id: 'user-123',
  session_id: 'session-123',
  joined_at: new Date().toISOString(),
  device_type: 'desktop',
  browser: 'chrome',
  created_at: new Date().toISOString(),
};

describe('StreamingService', () => {
  let service: StreamingService;

  beforeEach(() => {
    resetAllMocks();
    service = new StreamingService();
  });

  describe('createStream', () => {
    it('should create new stream', async () => {
      const createData = {
        title: 'Test Stream',
        description: 'Test description',
        category: 'meeting' as const,
        scheduled_at: new Date().toISOString(),
        created_by: 'admin-123',
      };

      setupMockDatabaseSuccess({ ...mockStream, ...createData });

      const result = await service.createStream(createData);

      expect(result.title).toBe(createData.title);
      expect(result.category).toBe(createData.category);
      expect(result.stream_key).toBeDefined();
    });

    it('should generate unique stream key', async () => {
      const createData = {
        title: 'Test Stream',
        category: 'meeting' as const,
        created_by: 'admin-123',
      };

      setupMockDatabaseSuccess({ ...mockStream, ...createData });

      const result = await service.createStream(createData);

      expect(result.stream_key).toMatch(/^stream-/);
    });

    it('should handle creation errors', async () => {
      setupMockDatabaseError('Creation failed');

      const createData = {
        title: 'Test Stream',
        category: 'meeting' as const,
        created_by: 'admin-123',
      };

      await expect(service.createStream(createData)).rejects.toThrow(
        'Failed to create stream'
      );
    });
  });

  describe('getStreams', () => {
    it('should return paginated streams', async () => {
      const mockData = [mockStream];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getStreams({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      const mockData = [mockStream];
      setupMockDatabaseSuccess(mockData);

      await service.getStreams(
        { page: 1, limit: 10 },
        { status: 'live' }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('streams');
    });

    it('should filter by category', async () => {
      const mockData = [mockStream];
      setupMockDatabaseSuccess(mockData);

      await service.getStreams(
        { page: 1, limit: 10 },
        { category: 'meeting' }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('streams');
    });
  });

  describe('getStreamById', () => {
    it('should return stream by ID', async () => {
      setupMockDatabaseSuccess(mockStream);

      const result = await service.getStreamById('stream-123');

      expect(result).toEqual(mockStream);
    });

    it('should return null for non-existent stream', async () => {
      setupMockDatabaseError('PGRST116'); // Not found error code

      const result = await service.getStreamById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateStream', () => {
    it('should update stream', async () => {
      const updateData = {
        title: 'Updated Stream Title',
        status: 'live' as const,
      };

      setupMockDatabaseSuccess({ ...mockStream, ...updateData });

      const result = await service.updateStream('stream-123', updateData);

      expect(result.title).toBe(updateData.title);
      expect(result.status).toBe(updateData.status);
    });

    it('should handle update errors', async () => {
      setupMockDatabaseError('Update failed');

      await expect(
        service.updateStream('stream-123', { title: 'New Title' })
      ).rejects.toThrow('Failed to update stream');
    });
  });

  describe('startStream', () => {
    it('should start stream', async () => {
      const startedStream = {
        ...mockStream,
        status: 'live',
        started_at: new Date().toISOString(),
      };

      setupMockDatabaseSuccess(startedStream);

      const result = await service.startStream('stream-123');

      expect(result.status).toBe('live');
      expect(result.started_at).toBeDefined();
    });
  });

  describe('endStream', () => {
    it('should end stream', async () => {
      const endedStream = {
        ...mockStream,
        status: 'ended',
        ended_at: new Date().toISOString(),
        final_viewer_count: 25,
      };

      setupMockDatabaseSuccess(endedStream);

      const result = await service.endStream('stream-123');

      expect(result.status).toBe('ended');
      expect(result.ended_at).toBeDefined();
    });
  });

  describe('deleteStream', () => {
    it('should delete stream', async () => {
      setupMockDatabaseSuccess(null);

      await expect(service.deleteStream('stream-123')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      setupMockDatabaseError('Deletion failed');

      await expect(service.deleteStream('stream-123')).rejects.toThrow(
        'Failed to delete stream'
      );
    });
  });

  describe('addViewer', () => {
    it('should add viewer to stream', async () => {
      const viewerData = {
        stream_id: 'stream-123',
        user_id: 'user-123',
        session_id: 'session-123',
        device_type: 'desktop',
        browser: 'chrome',
      };

      setupMockDatabaseSuccess({ ...mockViewer, ...viewerData });

      const result = await service.addViewer(viewerData);

      expect(result.stream_id).toBe(viewerData.stream_id);
      expect(result.user_id).toBe(viewerData.user_id);
    });
  });

  describe('removeViewer', () => {
    it('should remove viewer from stream', async () => {
      const updatedViewer = {
        ...mockViewer,
        left_at: new Date().toISOString(),
        watch_duration_seconds: 1800,
      };

      setupMockDatabaseSuccess(updatedViewer);

      const result = await service.removeViewer('viewer-123');

      expect(result.left_at).toBeDefined();
      expect(result.watch_duration_seconds).toBeGreaterThan(0);
    });
  });

  describe('getStreamViewers', () => {
    it('should return current stream viewers', async () => {
      const mockData = [mockViewer];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getStreamViewers('stream-123');

      expect(result).toEqual(mockData);
    });
  });

  describe('updateViewerCount', () => {
    it('should update stream viewer count', async () => {
      const updatedStream = {
        ...mockStream,
        viewer_count: 15,
        peak_viewer_count: 20,
      };

      setupMockDatabaseSuccess(updatedStream);

      const result = await service.updateViewerCount('stream-123', 15);

      expect(result.viewer_count).toBe(15);
    });
  });

  describe('getLiveStreams', () => {
    it('should return currently live streams', async () => {
      const liveStream = { ...mockStream, status: 'live' };
      const mockData = [liveStream];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getLiveStreams();

      expect(result).toEqual(mockData);
    });
  });

  describe('getUpcomingStreams', () => {
    it('should return scheduled streams', async () => {
      const upcomingStream = {
        ...mockStream,
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      };
      const mockData = [upcomingStream];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getUpcomingStreams();

      expect(result).toEqual(mockData);
    });
  });
});
