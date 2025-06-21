import { BaseService, PaginationOptions, PaginationResult, FilterOptions, SortOptions } from './base.service';
import { Database } from '@/config/database.types';

type DocumentRequest = Database['public']['Tables']['document_requests']['Row'];
type DocumentRequestInsert = Database['public']['Tables']['document_requests']['Insert'];
type DocumentRequestUpdate = Database['public']['Tables']['document_requests']['Update'];
type DocumentType = Database['public']['Tables']['document_types']['Row'];
type DocumentAttachment = Database['public']['Tables']['document_attachments']['Row'];

export interface DocumentRequestFilters extends FilterOptions {
  status?: string;
  document_type_id?: string;
  applicant_id?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateDocumentRequestData {
  document_type_id: string;
  applicant_id: string;
  purpose: string;
  additional_data?: any;
  priority?: 'normal' | 'urgent';
}

export interface DocumentRequestWithDetails extends DocumentRequest {
  document_type?: DocumentType;
  applicant?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  attachments?: DocumentAttachment[];
  workflow_status?: any[];
  signatures?: any[];
}

export class DocumentsService extends BaseService {
  private readonly tableName = 'document_requests';

  /**
   * Get document requests with pagination and filtering
   */
  async getAll(
    options: PaginationOptions = {},
    filters: DocumentRequestFilters = {},
    sort: SortOptions = { column: 'created_at', ascending: false }
  ): Promise<PaginationResult<DocumentRequestWithDetails>> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(`
          *,
          document_type:document_types(*),
          applicant:user_profiles!applicant_id(first_name, last_name, email),
          attachments:document_attachments(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.document_type_id) {
        query = query.eq('document_type_id', filters.document_type_id);
      }
      
      if (filters.applicant_id) {
        query = query.eq('applicant_id', filters.applicant_id);
      }
      
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      
      if (filters.date_from) {
        query = query.gte('requested_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('requested_at', filters.date_to);
      }

      // Apply sorting
      query = this.applySorting(query, sort);

      // Apply pagination
      query = this.applyPagination(query, options);

      const { data, count } = await this.executeQueryWithCount<DocumentRequestWithDetails>(
        query,
        'get document requests'
      );

      const { page = 1, limit = 10 } = options;
      const pagination = this.calculatePagination(count, page, limit);

      return { data, pagination };
    } catch (error) {
      this.handleError(error, 'get document requests');
    }
  }

  /**
   * Get document request by ID with full details
   */
  async getById(id: string): Promise<DocumentRequestWithDetails | null> {
    try {
      const { data } = await this.client
        .rpc('get_document_request_with_workflow', { p_request_id: id });

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        ...result.request_data,
        workflow_status: result.workflow_status,
        attachments: result.attachments,
        signatures: result.signatures,
      };
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      this.handleError(error, 'get document request by ID');
    }
  }

  /**
   * Create new document request
   */
  async create(data: CreateDocumentRequestData): Promise<DocumentRequest> {
    try {
      this.validateRequired(data, ['document_type_id', 'applicant_id', 'purpose']);

      // Generate request number
      const requestNumber = await this.generateRequestNumber();

      const insertData: DocumentRequestInsert = {
        id: this.generateId(),
        request_number: requestNumber,
        document_type_id: data.document_type_id,
        applicant_id: data.applicant_id,
        purpose: data.purpose,
        status: 'pending',
        payment_status: 'unpaid',
        requested_at: this.getCurrentTimestamp(),
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      const request = await this.executeQuery<DocumentRequest>(query, 'create document request');

      // Initialize workflow
      await this.initializeWorkflow(request.id, data.document_type_id);

      return request;
    } catch (error) {
      this.handleError(error, 'create document request');
    }
  }

  /**
   * Update document request
   */
  async update(id: string, data: Partial<DocumentRequestUpdate>): Promise<DocumentRequest> {
    try {
      const updateData: DocumentRequestUpdate = {
        ...this.cleanData(data),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<DocumentRequest>(query, 'update document request');
    } catch (error) {
      this.handleError(error, 'update document request');
    }
  }

  /**
   * Update document request status
   */
  async updateStatus(
    id: string,
    status: string,
    processedBy?: string,
    notes?: string
  ): Promise<DocumentRequest> {
    try {
      const updateData: DocumentRequestUpdate = {
        status,
        processed_by: processedBy,
        notes,
        updated_at: this.getCurrentTimestamp(),
      };

      // Set processed_at timestamp for certain statuses
      if (['ready', 'released'].includes(status)) {
        updateData.processed_at = this.getCurrentTimestamp();
      }

      if (status === 'released') {
        updateData.released_at = this.getCurrentTimestamp();
      }

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<DocumentRequest>(query, 'update document status');
    } catch (error) {
      this.handleError(error, 'update document status');
    }
  }

  /**
   * Get document types
   */
  async getDocumentTypes(): Promise<DocumentType[]> {
    try {
      const query = this.client
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return await this.executeQuery<DocumentType[]>(query, 'get document types');
    } catch (error) {
      this.handleError(error, 'get document types');
    }
  }

  /**
   * Upload document attachment
   */
  async uploadAttachment(
    documentRequestId: string,
    fileData: {
      fileName: string;
      filePath: string;
      fileSize: number;
      fileType: string;
      mimeType: string;
      attachmentType?: string;
      isRequired?: boolean;
    },
    uploadedBy: string
  ): Promise<DocumentAttachment> {
    try {
      const insertData = {
        id: this.generateId(),
        document_request_id: documentRequestId,
        file_name: fileData.fileName,
        file_path: fileData.filePath,
        file_size: fileData.fileSize,
        file_type: fileData.fileType,
        mime_type: fileData.mimeType,
        attachment_type: fileData.attachmentType || 'requirement',
        is_required: fileData.isRequired || false,
        uploaded_by: uploadedBy,
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from('document_attachments')
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<DocumentAttachment>(query, 'upload attachment');
    } catch (error) {
      this.handleError(error, 'upload attachment');
    }
  }

  /**
   * Get document statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    ready: number;
    released: number;
    cancelled: number;
  }> {
    try {
      const [total, pending, processing, ready, released, cancelled] = await Promise.all([
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'ready'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'released'),
        this.client.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      ]);

      return {
        total: total.count || 0,
        pending: pending.count || 0,
        processing: processing.count || 0,
        ready: ready.count || 0,
        released: released.count || 0,
        cancelled: cancelled.count || 0,
      };
    } catch (error) {
      this.handleError(error, 'get document stats');
    }
  }

  /**
   * Generate request number
   */
  private async generateRequestNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest request number for this month
      const query = this.client
        .from(this.tableName)
        .select('request_number')
        .like('request_number', `${year}${month}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      const data = await this.executeQuery<{ request_number: string }[]>(query, 'get latest request number');
      
      let nextNumber = 1;
      if (data.length > 0) {
        const lastNumber = data[0].request_number;
        const match = lastNumber.match(/(\d{4})(\d{2})(\d{4})/);
        if (match) {
          nextNumber = parseInt(match[3]) + 1;
        }
      }

      return `${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      this.handleError(error, 'generate request number');
    }
  }

  /**
   * Initialize workflow for document request
   */
  private async initializeWorkflow(requestId: string, documentTypeId: string): Promise<void> {
    try {
      // Get workflow steps for this document type
      const { data: steps } = await this.client
        .from('document_workflow_steps')
        .select('*')
        .eq('document_type_id', documentTypeId)
        .order('step_order');

      if (!steps || steps.length === 0) {
        return; // No workflow defined
      }

      // Create workflow tracking records
      const workflowRecords = steps.map(step => ({
        id: this.generateId(),
        document_request_id: requestId,
        workflow_step_id: step.id,
        status: 'pending',
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      }));

      await this.client
        .from('document_request_workflow')
        .insert(workflowRecords);
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
      // Don't throw error here as the main request was created successfully
    }
  }
}
