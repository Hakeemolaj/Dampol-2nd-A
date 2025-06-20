import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
  documentRequestId?: string;
  category: string;
}

class FileStorageService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    this.allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }

    // Create subdirectories
    const subdirs = ['documents', 'temp', 'processed'];
    for (const subdir of subdirs) {
      const dirPath = path.join(this.uploadDir, subdir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }

  // Configure multer for file uploads
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadDir, 'temp'));
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 5 // Maximum 5 files per request
      }
    });
  }

  // Move file from temp to permanent storage
  async moveToStorage(tempFilePath: string, category: string = 'documents'): Promise<string> {
    const filename = path.basename(tempFilePath);
    const permanentPath = path.join(this.uploadDir, category, filename);
    
    await fs.rename(tempFilePath, permanentPath);
    return permanentPath;
  }

  // Save file metadata
  async saveFileMetadata(metadata: Omit<FileMetadata, 'id' | 'uploadedAt'>): Promise<FileMetadata> {
    const fileMetadata: FileMetadata = {
      id: uuidv4(),
      ...metadata,
      uploadedAt: new Date().toISOString()
    };

    // In a real implementation, this would be saved to database
    // For now, we'll just return the metadata
    console.log('File metadata saved:', fileMetadata);
    
    return fileMetadata;
  }

  // Process uploaded file
  async processUpload(
    file: Express.Multer.File,
    uploadedBy: string,
    documentRequestId?: string,
    category: string = 'documents'
  ): Promise<FileUploadResult> {
    try {
      // Move file to permanent storage
      const permanentPath = await this.moveToStorage(file.path, category);
      
      // Generate file URL (in production, this would be a proper URL)
      const fileUrl = `/api/v1/files/${path.basename(permanentPath)}`;

      // Save metadata
      const metadata = await this.saveFileMetadata({
        filename: path.basename(permanentPath),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: permanentPath,
        uploadedBy,
        documentRequestId,
        category
      });

      return {
        id: metadata.id,
        filename: metadata.filename,
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: metadata.size,
        path: permanentPath,
        url: fileUrl,
        uploadedAt: metadata.uploadedAt
      };
    } catch (error) {
      // Clean up temp file if processing fails
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up temp file:', unlinkError);
      }
      throw error;
    }
  }

  // Get file by ID
  async getFile(fileId: string): Promise<FileMetadata | null> {
    // In a real implementation, this would query the database
    // For now, return null
    console.log('Getting file:', fileId);
    return null;
  }

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const fileMetadata = await this.getFile(fileId);
      if (!fileMetadata) {
        return false;
      }

      // Delete physical file
      await fs.unlink(fileMetadata.path);
      
      // Delete metadata from database
      // In a real implementation, this would delete from database
      console.log('File deleted:', fileId);
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Serve file
  async serveFile(filename: string): Promise<{ path: string; mimeType: string } | null> {
    try {
      const filePath = path.join(this.uploadDir, 'documents', filename);
      await fs.access(filePath);
      
      // Get mime type from extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      return {
        path: filePath,
        mimeType: mimeTypeMap[ext] || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error serving file:', error);
      return null;
    }
  }

  // Clean up old temp files
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          console.log(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, { count: number; size: number }>;
  }> {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {} as Record<string, { count: number; size: number }>
      };

      const categories = ['documents', 'temp', 'processed'];
      
      for (const category of categories) {
        const categoryDir = path.join(this.uploadDir, category);
        try {
          const files = await fs.readdir(categoryDir);
          let categorySize = 0;
          
          for (const file of files) {
            const filePath = path.join(categoryDir, file);
            const fileStats = await fs.stat(filePath);
            categorySize += fileStats.size;
          }
          
          stats.byCategory[category] = {
            count: files.length,
            size: categorySize
          };
          
          stats.totalFiles += files.length;
          stats.totalSize += categorySize;
        } catch (error) {
          console.error(`Error reading category ${category}:`, error);
          stats.byCategory[category] = { count: 0, size: 0 };
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {}
      };
    }
  }
}

export const fileStorageService = new FileStorageService();
export default fileStorageService;
