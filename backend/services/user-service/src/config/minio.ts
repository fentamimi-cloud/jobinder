import { Client } from 'minio';
import { logger } from '../../../../shared/utils/logger';

// MinIO client configuration
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Bucket names
export const BUCKETS = {
  AVATARS: 'jobinder-avatars',
  RESUMES: 'jobinder-resumes',
  COMPANY_LOGOS: 'jobinder-logos',
};

// Initialize buckets
export async function initializeMinIO() {
  try {
    // Create buckets if they don't exist
    for (const [name, bucketName] of Object.entries(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        
        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        logger.info(`MinIO bucket created: ${bucketName}`);
      } else {
        logger.info(`MinIO bucket exists: ${bucketName}`);
      }
    }
    
    logger.info('MinIO initialization complete');
  } catch (error) {
    logger.error('MinIO initialization error:', error);
    throw error;
  }
}

// Generate public URL for an object
export function getPublicUrl(bucketName: string, objectName: string): string {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  
  return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
}

