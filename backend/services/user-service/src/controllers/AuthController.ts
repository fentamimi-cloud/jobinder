import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { logger } from '../../../../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    customClaims?: any;
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Sign up a new user
   * POST /api/auth/signup
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, userType, location, agreeToTerms } = req.body;

      // Validate terms agreement
      if (!agreeToTerms) {
        res.status(400).json({
          success: false,
          message: 'You must agree to the terms and conditions'
        });
        return;
      }

      logger.info('Sign-up request received:', { email, userType });

      const result = await this.authService.signUp({
        email,
        password,
        firstName,
        lastName,
        userType,
        location,
      });

      if (!result.success) {
        res.status(result.message.includes('already') ? 409 : 400).json(result);
        return;
      }

      res.status(201).json(result);

    } catch (error) {
      logger.error('Sign-up controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Login (verify and update last login)
   * POST /api/auth/login
   * Note: Actual authentication happens in Firebase client SDK
   * This endpoint just verifies the user exists and updates login time
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const uid = req.user.uid;
      logger.info('Login request received:', { uid, email: req.user.email });

      const result = await this.authService.login(uid);

      if (!result.success) {
        res.status(result.message.includes('suspended') ? 403 : 404).json(result);
        return;
      }

      res.status(200).json(result);

    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Logout (invalidate session if needed)
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const uid = req.user.uid;
      logger.info('Logout request received:', { uid });

      // In Firebase, logout happens client-side by clearing the token
      // Server can optionally invalidate sessions or revoke tokens
      // For now, we'll just log the logout

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  async verifyEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const uid = req.user.uid;
      logger.info('Email verification request:', { uid });

      const result = await this.authService.verifyEmail(uid);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);

    } catch (error) {
      logger.error('Email verification controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  }

  /**
   * Delete account
   * DELETE /api/auth/account
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const uid = req.user.uid;
      logger.info('Account deletion request:', { uid });

      const result = await this.authService.deleteAccount(uid);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);

    } catch (error) {
      logger.error('Account deletion controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const uid = req.user.uid;
      const user = await this.authService.getUserByUid(uid);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user data'
      });
    }
  }
}

