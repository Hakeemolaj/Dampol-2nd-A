// Test suite for DocumentsService
import { DocumentsService } from '@/services/database/documents.service';
import {
  mockSupabaseClient,
  setupMockDatabaseSuccess,
  setupMockDatabaseError,
  resetAllMocks,
} from '../setup/supabase-mock';

// Mock the Supabase config
jest.mock('@/config/supabase', () => ({
  supabaseAdmin: mockSupabaseClient,
}));

const mockDocumentRequest = {
  id: 'doc-123',
  request_number: 'REQ-2024-001',
  document_type_id: 'type-123',
  applicant_id: 'user-123',
  purpose: 'Employment',
  status: 'pending',
  fee_amount: 50,
  payment_status: 'unpaid',
  requested_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockDocumentType = {
  id: 'type-123',
  name: 'Barangay Clearance',
  description: 'Certificate of good moral character',
  fee_amount: 50,
  processing_days: 3,
  requirements: ['Valid ID', 'Proof of Residency'],
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(() => {
    resetAllMocks();
    service = new DocumentsService(mockSupabaseClient);
  });

  describe('getDocumentRequests', () => {
    it('should return paginated document requests', async () => {
      const mockData = [mockDocumentRequest];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getDocumentRequests({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      const mockData = [mockDocumentRequest];
      setupMockDatabaseSuccess(mockData);

      await service.getDocumentRequests(
        { page: 1, limit: 10 },
        { status: 'pending' }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('document_requests');
    });

    it('should handle database errors', async () => {
      setupMockDatabaseError('Database connection failed');

      await expect(service.getDocumentRequests()).rejects.toThrow(
        'Failed to get document requests'
      );
    });
  });

  describe('getDocumentRequestById', () => {
    it('should return document request by ID', async () => {
      setupMockDatabaseSuccess(mockDocumentRequest);

      const result = await service.getDocumentRequestById('doc-123');

      expect(result).toEqual(mockDocumentRequest);
    });

    it('should return null for non-existent request', async () => {
      setupMockDatabaseError('PGRST116'); // Not found error code

      const result = await service.getDocumentRequestById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('createDocumentRequest', () => {
    it('should create new document request', async () => {
      const createData = {
        document_type_id: 'type-123',
        applicant_id: 'user-123',
        purpose: 'Employment',
      };

      setupMockDatabaseSuccess({ ...mockDocumentRequest, ...createData });

      const result = await service.createDocumentRequest(createData);

      expect(result.document_type_id).toBe(createData.document_type_id);
      expect(result.purpose).toBe(createData.purpose);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        purpose: 'Employment',
        // Missing required fields
      };

      await expect(service.createDocumentRequest(invalidData as any)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should generate request number', async () => {
      const createData = {
        document_type_id: 'type-123',
        applicant_id: 'user-123',
        purpose: 'Employment',
      };

      setupMockDatabaseSuccess({ ...mockDocumentRequest, ...createData });

      const result = await service.createDocumentRequest(createData);

      expect(result.request_number).toMatch(/^REQ-\d{4}-\d{3}$/);
    });
  });

  describe('updateDocumentRequest', () => {
    it('should update document request', async () => {
      const updateData = {
        status: 'approved',
        processed_by: 'admin-123',
        notes: 'Approved for processing',
      };

      setupMockDatabaseSuccess({ ...mockDocumentRequest, ...updateData });

      const result = await service.updateDocumentRequest('doc-123', updateData);

      expect(result.status).toBe(updateData.status);
      expect(result.processed_by).toBe(updateData.processed_by);
    });

    it('should handle update errors', async () => {
      setupMockDatabaseError('Update failed');

      await expect(
        service.updateDocumentRequest('doc-123', { status: 'approved' })
      ).rejects.toThrow('Failed to update document request');
    });
  });

  describe('getDocumentTypes', () => {
    it('should return active document types', async () => {
      const mockData = [mockDocumentType];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getDocumentTypes();

      expect(result).toEqual(mockData);
    });

    it('should filter by active status', async () => {
      const mockData = [mockDocumentType];
      setupMockDatabaseSuccess(mockData);

      await service.getDocumentTypes();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('document_types');
    });
  });

  describe('getDocumentTypeById', () => {
    it('should return document type by ID', async () => {
      setupMockDatabaseSuccess(mockDocumentType);

      const result = await service.getDocumentTypeById('type-123');

      expect(result).toEqual(mockDocumentType);
    });
  });

  describe('getRequestsByApplicant', () => {
    it('should return requests for specific applicant', async () => {
      const mockData = [mockDocumentRequest];
      setupMockDatabaseSuccess(mockData);

      const result = await service.getRequestsByApplicant('user-123');

      expect(result.data).toEqual(mockData);
    });
  });

  describe('getRequestStats', () => {
    it('should return request statistics', async () => {
      // Mock multiple database calls for stats
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 10 }),
      }));

      const result = await service.getRequestStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('approved');
      expect(result).toHaveProperty('completed');
    });
  });

  describe('approveRequest', () => {
    it('should approve document request', async () => {
      const approvedRequest = {
        ...mockDocumentRequest,
        status: 'approved',
        processed_at: new Date().toISOString(),
      };

      setupMockDatabaseSuccess(approvedRequest);

      const result = await service.approveRequest('doc-123', 'admin-123');

      expect(result.status).toBe('approved');
      expect(result.processed_at).toBeDefined();
    });
  });

  describe('rejectRequest', () => {
    it('should reject document request', async () => {
      const rejectedRequest = {
        ...mockDocumentRequest,
        status: 'rejected',
        notes: 'Incomplete requirements',
      };

      setupMockDatabaseSuccess(rejectedRequest);

      const result = await service.rejectRequest('doc-123', 'admin-123', 'Incomplete requirements');

      expect(result.status).toBe('rejected');
      expect(result.notes).toBe('Incomplete requirements');
    });
  });

  describe('completeRequest', () => {
    it('should complete document request', async () => {
      const completedRequest = {
        ...mockDocumentRequest,
        status: 'completed',
        released_at: new Date().toISOString(),
      };

      setupMockDatabaseSuccess(completedRequest);

      const result = await service.completeRequest('doc-123');

      expect(result.status).toBe('completed');
      expect(result.released_at).toBeDefined();
    });
  });
});
