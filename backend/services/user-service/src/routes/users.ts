import express from 'express';
import { authenticateToken, requireUserType } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserController } from '../controllers/UserController';
import { 
  userRegistrationSchema, 
  updateUserProfileSchema 
} from '../validation/userSchemas';

const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', 
  validateRequest(userRegistrationSchema),
  userController.register.bind(userController)
);

// Protected routes
router.use(authenticateToken);

router.get('/profile', 
  userController.getProfile.bind(userController)
);

router.put('/profile', 
  validateRequest(updateUserProfileSchema),
  userController.updateProfile.bind(userController)
);

router.get('/profile/:userId',
  userController.getPublicProfile.bind(userController)
);

router.delete('/profile',
  userController.deleteProfile.bind(userController)
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
