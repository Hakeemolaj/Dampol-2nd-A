import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '@/components/documents/FileUpload';

// Mock fetch
global.fetch = jest.fn();

// Mock XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  addEventListener: jest.fn(),
  upload: {
    addEventListener: jest.fn()
  },
  status: 200,
  responseText: JSON.stringify({
    success: true,
    data: [{
      id: 'test-file-id',
      filename: 'test-file.pdf',
      originalName: 'test-file.pdf',
      size: 1024,
      url: '/api/v1/files/test-file.pdf',
      uploadedAt: new Date().toISOString()
    }]
  })
};

// Create a proper XMLHttpRequest constructor mock
const XMLHttpRequestMock = jest.fn(() => mockXHR) as any;
XMLHttpRequestMock.UNSENT = 0;
XMLHttpRequestMock.OPENED = 1;
XMLHttpRequestMock.HEADERS_RECEIVED = 2;
XMLHttpRequestMock.LOADING = 3;
XMLHttpRequestMock.DONE = 4;
XMLHttpRequestMock.prototype = XMLHttpRequest.prototype;

global.XMLHttpRequest = XMLHttpRequestMock;

describe('FileUpload Component', () => {
  const defaultProps = {
    requestId: 'test-request-id',
    maxFiles: 5,
    maxFileSize: 5,
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Upload Supporting Documents')).toBeInTheDocument();
    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });

  it('displays file limits correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText(/Maximum 5 files, 5MB each/)).toBeInTheDocument();
    expect(screen.getByText(/Allowed types: PDF, JPG, JPEG, PNG, DOC, DOCX/)).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    render(<FileUpload {...defaultProps} maxFileSize={1} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [largeFile] }
    });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 1MB/)).toBeInTheDocument();
    });
  });

  it('validates file type', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, {
      target: { files: [invalidFile] }
    });

    await waitFor(() => {
      expect(screen.getByText(/File type .txt is not allowed/)).toBeInTheDocument();
    });
  });

  it('respects maximum file limit', async () => {
    render(<FileUpload {...defaultProps} maxFiles={2} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
      new File(['content3'], 'file3.pdf', { type: 'application/pdf' })
    ];
    
    fireEvent.change(fileInput, {
      target: { files }
    });

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
      expect(screen.queryByText('file3.pdf')).not.toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Drop files here or click to browse').closest('div');
    
    const file = new File(['test content'], 'dropped.pdf', { type: 'application/pdf' });
    
    fireEvent.dragOver(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('dropped.pdf')).toBeInTheDocument();
    });
  });

  it('removes files when remove button is clicked', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('disables choose files button when max files reached', async () => {
    render(<FileUpload {...defaultProps} maxFiles={1} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    const chooseButton = screen.getByRole('button', { name: /choose files/i });
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    await waitFor(() => {
      expect(chooseButton).toBeDisabled();
    });
  });

  it('calls onUploadComplete callback when upload succeeds', async () => {
    const onUploadComplete = jest.fn();
    render(<FileUpload {...defaultProps} onUploadComplete={onUploadComplete} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    // Simulate successful upload
    await waitFor(() => {
      const loadHandler = mockXHR.addEventListener.mock.calls.find(call => call[0] === 'load')[1];
      loadHandler();
    });

    expect(onUploadComplete).toHaveBeenCalledWith([{
      id: 'test-file-id',
      filename: 'test-file.pdf',
      originalName: 'test-file.pdf',
      size: 1024,
      url: '/api/v1/files/test-file.pdf',
      uploadedAt: expect.any(String)
    }]);
  });

  it('displays upload progress', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Simulate upload progress
    const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(call => call[0] === 'progress')[1];
    progressHandler({
      lengthComputable: true,
      loaded: 512,
      total: 1024
    });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('handles upload errors gracefully', async () => {
    const errorXHR = {
      ...mockXHR,
      status: 500
    };
    const ErrorXMLHttpRequestMock = jest.fn(() => errorXHR) as any;
    ErrorXMLHttpRequestMock.UNSENT = 0;
    ErrorXMLHttpRequestMock.OPENED = 1;
    ErrorXMLHttpRequestMock.HEADERS_RECEIVED = 2;
    ErrorXMLHttpRequestMock.LOADING = 3;
    ErrorXMLHttpRequestMock.DONE = 4;
    ErrorXMLHttpRequestMock.prototype = XMLHttpRequest.prototype;

    global.XMLHttpRequest = ErrorXMLHttpRequestMock;

    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    // Simulate upload error
    await waitFor(() => {
      const errorHandler = errorXHR.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler();
    });

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });

  it('formats file sizes correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    // This tests the internal formatFileSize function indirectly
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const file = new File(['x'.repeat(1024)], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    waitFor(() => {
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });
  });

  it('displays upload summary correctly', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose files/i }).nextElementSibling as HTMLInputElement;
    
    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
    ];
    
    fireEvent.change(fileInput, {
      target: { files }
    });

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Uploading')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });
});
