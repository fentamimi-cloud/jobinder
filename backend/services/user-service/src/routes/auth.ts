import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AuthController } from '../controllers/AuthController';
import { signUpSchema, loginSchema } from '../validation/authSchemas';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/signup',
  validateRequest(signUpSchema),
  authController.signUp.bind(authController)
);

// Protected routes (require authentication token)
router.post('/login',
  authenticateToken,
  authController.login.bind(authController)
);

router.post('/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

router.post('/verify-email',
  authenticateToken,
  authController.verifyEmail.bind(authController)
);

router.delete('/account',
  authenticateToken,
  authController.deleteAccount.bind(authController)
);

router.get('/me',
  authenticateToken,
  authController.getCurrentUser.bind(authController)
);

export { router as authRoutes };

