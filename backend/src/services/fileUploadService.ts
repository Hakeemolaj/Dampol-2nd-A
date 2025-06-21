import { supabase } from '@/config/supabase';
import { CustomError } from '@/middleware/errorHandler';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  publicUrl?: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  generateUniqueName?: boolean;
}

export class FileUploadService {
  private readonly defaultBucket = 'documents';
  private readonly defaultMaxSize = 10 * 1024 * 1024; // 10MB
  private readonly defaultAllowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    originalFileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        bucket = this.defaultBucket,
        folder = 'uploads',
        maxSize = this.defaultMaxSize,
        allowedTypes = this.defaultAllowedTypes,
        generateUniqueName = true,
      } = options;

      // Validate file size
      if (file.length > maxSize) {
        throw new CustomError(
          `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`,
          400
        );
      }

      // Get file extension and MIME type
      const fileExtension = path.extname(originalFileName).toLowerCase();
      const mimeType = this.getMimeType(fileExtension);

      // Validate file type
      if (!allowedTypes.includes(mimeType)) {
        throw new CustomError(
          `File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          400
        );
      }

      // Generate file name
      const fileName = generateUniqueName
        ? `${uuidv4()}${fileExtension}`
        : originalFileName;

      // Create file path
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        throw new CustomError(`Upload failed: ${error.message}`, 500);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        fileName,
        filePath: data.path,
        fileSize: file.length,
        fileType: fileExtension,
        mimeType,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('File upload failed', 500);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer | Uint8Array; fileName: string }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.fileName, options);
        results.push(result);
      } catch (error) {
        errors.push(`${file.fileName}: ${error.message}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new CustomError(`All uploads failed: ${errors.join(', ')}`, 400);
    }

    return results;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string, bucket: string = this.defaultBucket): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw new CustomError(`Delete failed: ${error.message}`, 500);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('File deletion failed', 500);
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(
    filePath: string,
    bucket: string = this.defaultBucket,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new CustomError(`Failed to get download URL: ${error.message}`, 500);
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get download URL', 500);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.dirname(filePath), {
          search: path.basename(filePath),
        });

      if (error) {
        return false;
      }

      return data.some(file => file.name === path.basename(filePath));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string, bucket: string = this.defaultBucket): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.dirname(filePath), {
          search: path.basename(filePath),
        });

      if (error) {
        throw new CustomError(`Failed to get file metadata: ${error.message}`, 500);
      }

      const file = data.find(f => f.name === path.basename(filePath));
      if (!file) {
        throw new CustomError('File not found', 404);
      }

      return file;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get file metadata', 500);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: Buffer | Uint8Array,
    fileName: string,
    options: UploadOptions = {}
  ): { valid: boolean; error?: string } {
    const {
      maxSize = this.defaultMaxSize,
      allowedTypes = this.defaultAllowedTypes,
    } = options;

    // Check file size
    if (file.length > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`,
      };
    }

    // Check file type
    const fileExtension = path.extname(fileName).toLowerCase();
    const mimeType = this.getMimeType(fileExtension);

    if (!allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${fileExtension} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
