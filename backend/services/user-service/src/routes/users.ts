import express from 'express';
import { authenticateToken, requireUserType } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { uploadAvatar, uploadResume } from '../middleware/upload';
import { UserControllerEnhanced } from '../controllers/UserControllerEnhanced';
import { 
  updateUserProfileSchema 
} from '../validation/userSchemas';

const router = express.Router();
const userController = new UserControllerEnhanced();

// Protected routes (require authentication)
router.use(authenticateToken);

// Profile management
router.get('/profile', 
  userController.getProfile.bind(userController)
);

router.put('/profile', 
  validateRequest(updateUserProfileSchema),
  userController.updateProfile.bind(userController)
);

router.get('/profile/stats',
  userController.getProfileStats.bind(userController)
);

router.get('/profile/:userId',
  userController.getPublicProfile.bind(userController)
);

router.delete('/profile',
  userController.deleteProfile.bind(userController)
);

// Onboarding
router.post('/profile/complete-onboarding',
  validateRequest(updateUserProfileSchema),
  userController.completeOnboarding.bind(userController)
);

// File uploads
router.post('/profile/upload-avatar',
  uploadAvatar,
  userController.uploadAvatar.bind(userController)
);

router.post('/profile/upload-resume',
  uploadResume,
  userController.uploadResume.bind(userController)
);

// Admin only routes
router.get('/',
  requireUserType(['admin']),
  userController.getAllUsers.bind(userController)
);

router.put('/:userId/status',
  requireUserType(['admin']),
  userController.updateUserStatus.bind(userController)
);

export { router as userRoutes };
