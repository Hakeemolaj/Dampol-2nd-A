import { apiRequest, ApiError } from '@/lib/api'

export interface DocumentRequest {
  id: string
  type: string
  status: 'pending' | 'under_review' | 'approved' | 'ready_for_pickup' | 'completed' | 'rejected'
  applicantName: string
  contactNumber: string
  email?: string
  purpose: string
  submittedAt: string
  updatedAt: string
  estimatedCompletion?: string
  notes?: string
  fee: number
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  trackingNumber: string
  documents?: {
    name: string
    url: string
    uploadedAt: string
  }[]
}

export interface DocumentRequestForm {
  type: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  placeOfBirth?: string
  civilStatus: string
  address: string
  contactNumber: string
  email?: string
  purpose: string
  otherPurpose?: string
  additionalInfo?: Record<string, any>
}

export interface DocumentType {
  id: string
  name: string
  description: string
  fee: number
  processingTime: string
  requirements: string[]
  purposes: string[]
}

export interface DocumentRequestResponse {
  success: boolean
  data: DocumentRequest
  message: string
}

export interface DocumentRequestsResponse {
  success: boolean
  data: DocumentRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DocumentTypesResponse {
  success: boolean
  data: DocumentType[]
}

class DocumentService {
  // Submit a new document request
  async submitRequest(formData: DocumentRequestForm): Promise<DocumentRequestResponse> {
    try {
      return await apiRequest<DocumentRequestResponse>('/documents/requests', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to submit document request')
    }
  }

  // Get user's document requests
  async getUserRequests(page = 1, limit = 10): Promise<DocumentRequestsResponse> {
    try {
      return await apiRequest<DocumentRequestsResponse>(`/documents/requests?page=${page}&limit=${limit}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to fetch document requests')
    }
  }

  // Get a specific document request by ID
  async getRequestById(id: string): Promise<DocumentRequestResponse> {
    try {
      return await apiRequest<DocumentRequestResponse>(`/documents/requests/${id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to fetch document request')
    }
  }

  // Track document request by tracking number
  async trackRequest(trackingNumber: string): Promise<DocumentRequestResponse> {
    try {
      return await apiRequest<DocumentRequestResponse>(`/documents/track/${trackingNumber}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to track document request')
    }
  }

  // Get available document types
  async getDocumentTypes(): Promise<DocumentTypesResponse> {
    try {
      return await apiRequest<DocumentTypesResponse>('/documents/types')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to fetch document types')
    }
  }

  // Cancel a document request
  async cancelRequest(id: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest<{ success: boolean; message: string }>(`/documents/requests/${id}/cancel`, {
        method: 'POST',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to cancel document request')
    }
  }

  // Upload supporting documents
  async uploadDocument(requestId: string, file: File): Promise<{ success: boolean; url: string }> {
    try {
      const formData = new FormData()
      formData.append('document', file)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/requests/${requestId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to upload document')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to upload document')
    }
  }

  // Get document request statistics
  async getRequestStats(): Promise<{
    success: boolean
    data: {
      total: number
      pending: number
      approved: number
      completed: number
      rejected: number
    }
  }> {
    try {
      return await apiRequest<{
        success: boolean
        data: {
          total: number
          pending: number
          approved: number
          completed: number
          rejected: number
        }
      }>('/documents/requests/stats')
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Failed to fetch request statistics')
    }
  }
}

export default new DocumentService()
