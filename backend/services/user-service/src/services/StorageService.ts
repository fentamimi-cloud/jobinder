import { minioClient, BUCKETS, getPublicUrl } from '../config/minio';
import { logger } from '../../../../shared/utils/logger';
import crypto from 'crypto';
import path from 'path';

export class StorageService {
  /**
   * Upload avatar image
   */
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      
      // Upload to MinIO
      await minioClient.putObject(
        BUCKETS.AVATARS,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'x-amz-acl': 'public-read'
        }
      );

      // Generate public URL
      const url = getPublicUrl(BUCKETS.AVATARS, fileName);
      
      logger.info('Avatar uploaded successfully', { userId, fileName, url });
      return url;
    } catch (error) {
      logger.error('Avatar upload error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Upload resume file
   */
  async uploadResume(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      
      // Upload to MinIO
      await minioClient.putObject(
        BUCKETS.RESUMES,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'x-amz-acl': 'public-read'
        }
      );

      // Generate public URL
      const url = getPublicUrl(BUCKETS.RESUMES, fileName);
      
      logger.info('Resume uploaded successfully', { userId, fileName, url });
      return url;
    } catch (error) {
      logger.error('Resume upload error:', error);
      throw new Error('Failed to upload resume');
    }
  }

  /**
   * Upload company logo
   */
  async uploadLogo(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      
      // Upload to MinIO
      await minioClient.putObject(
        BUCKETS.COMPANY_LOGOS,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'x-amz-acl': 'public-read'
        }
      );

      // Generate public URL
      const url = getPublicUrl(BUCKETS.COMPANY_LOGOS, fileName);
      
      logger.info('Logo uploaded successfully', { userId, fileName, url });
      return url;
    } catch (error) {
      logger.error('Logo upload error:', error);
      throw new Error('Failed to upload logo');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract bucket and object name from URL
      const urlParts = new URL(url);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      
      if (pathParts.length < 2) {
        throw new Error('Invalid URL format');
      }

      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');

      await minioClient.removeObject(bucketName, objectName);
      logger.info('File deleted successfully', { bucketName, objectName });
    } catch (error) {
      logger.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(url: string) {
    try {
      const urlParts = new URL(url);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      
      if (pathParts.length < 2) {
        throw new Error('Invalid URL format');
      }

      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');

      const stat = await minioClient.statObject(bucketName, objectName);
      return stat;
    } catch (error) {
      logger.error('Get file info error:', error);
      throw new Error('Failed to get file info');
    }
  }

  /**
   * Generate presigned URL for temporary access
   */
  async getPresignedUrl(bucketName: string, objectName: string, expirySeconds: number = 3600): Promise<string> {
    try {
      const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
      return url;
    } catch (error) {
      logger.error('Generate presigned URL error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: Express.Multer.File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
    }

    return { valid: true };
  }

  /**
   * Validate resume file
   */
  validateResumeFile(file: Express.Multer.File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only PDF and Word documents are allowed.' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
    }

    return { valid: true };
  }
}

