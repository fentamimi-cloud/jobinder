import express from 'express';
import { firestore } from '../../../../shared/config/firebase';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Readiness check (checks dependencies)
router.get('/ready', async (req, res) => {
  try {
    // Check Firestore connection
    await firestore.doc('health/check').get();
    
    res.status(200).json({
      success: true,
      message: 'User service is ready',
      timestamp: new Date().toISOString(),
      checks: {
        firestore: 'healthy',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'User service is not ready',
      timestamp: new Date().toISOString(),
      checks: {
        firestore: 'unhealthy',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as healthRoutes };
