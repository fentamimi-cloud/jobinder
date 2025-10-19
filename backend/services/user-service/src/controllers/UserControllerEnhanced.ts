import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { StorageService } from '../services/StorageService';
import { logger } from '../../../../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    customClaims?: any;
  };
}

export class UserControllerEnhanced {
  private userService: UserService;
  private storageService: StorageService;

  constructor() {
    this.userService = new UserService();
    this.storageService = new StorageService();
  }

  /**
   * Get current user's complete profile
   * GET /api/users/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      
      const profile = await this.userService.getCompleteProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const updateData = req.body;
      
      logger.info('Updating profile for user:', { userId });
      
      // Update basic user data
      if (updateData.firstName || updateData.lastName || updateData.phone || updateData.location) {
        await this.userService.updateProfile(userId, {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          location: updateData.location,
        });
      }

      // Update role-specific profile
      const user = await this.userService.getCompleteProfile(userId);
      
      if (user?.userType === 'job_seeker' && updateData.jobSeekerProfile) {
        await this.userService.updateJobSeekerProfile(userId, updateData.jobSeekerProfile);
      } else if (user?.userType === 'employer' && updateData.employerProfile) {
        await this.userService.updateEmployerProfile(userId, updateData.employerProfile);
      }

      // Update settings
      if (updateData.privacy) {
        await this.userService.updatePrivacySettings(userId, updateData.privacy);
      }

      if (updateData.notificationSettings) {
        await this.userService.updateNotificationSettings(userId, updateData.notificationSettings);
      }

      // Get updated profile
      const updatedProfile = await this.userService.getCompleteProfile(userId);

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Get public profile
   * GET /api/users/profile/:userId
   */
  async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const profile = await this.userService.getPublicProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error getting public profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Delete user profile
   * DELETE /api/users/profile
   */
  async deleteProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      
      await this.userService.deleteProfile(userId);

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile'
      });
    }
  }

  /**
   * Complete onboarding
   * POST /api/users/profile/complete-onboarding
   */
  async completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const updateData = req.body;
      
      logger.info('Completing onboarding for user:', { userId, updateData });
      
      // Get user to check type
      const user = await this.userService.getCompleteProfile(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update role-specific profile
      if (user.userType === 'job_seeker' && updateData.jobSeekerProfile) {
        await this.userService.updateJobSeekerProfile(userId, updateData.jobSeekerProfile);
      } else if (user.userType === 'employer' && updateData.employerProfile) {
        await this.userService.updateEmployerProfile(userId, updateData.employerProfile);
      }

      // Mark onboarding as complete
      await this.userService.completeOnboarding(userId);

      // Get updated profile
      const updatedProfile = await this.userService.getCompleteProfile(userId);

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Onboarding completed successfully'
      });
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete onboarding'
      });
    }
  }

  /**
   * Upload profile picture
   * POST /api/users/profile/upload-avatar
   */
  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Validate image file
      const validation = this.storageService.validateImageFile(file);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      // Upload to MinIO
      const imageUrl = await this.storageService.uploadAvatar(file, userId);

      // Update user profile with new image URL
      await this.userService.updateProfilePicture(userId, imageUrl);

      res.json({
        success: true,
        data: { url: imageUrl },
        message: 'Profile picture uploaded successfully'
      });
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture'
      });
    }
  }

  /**
   * Upload resume
   * POST /api/users/profile/upload-resume
   */
  async uploadResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Validate resume file
      const validation = this.storageService.validateResumeFile(file);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      // Upload to MinIO
      const resumeUrl = await this.storageService.uploadResume(file, userId);

      // Update user profile with new resume URL
      await this.userService.updateResume(userId, resumeUrl);

      res.json({
        success: true,
        data: { url: resumeUrl },
        message: 'Resume uploaded successfully'
      });
    } catch (error) {
      logger.error('Error uploading resume:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload resume'
      });
    }
  }

  /**
   * Get profile stats
   * GET /api/users/profile/stats
   */
  async getProfileStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      
      const stats = await this.userService.getProfileStats(userId);

      if (!stats) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting profile stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile stats'
      });
    }
  }

  /**
   * Get all users (admin only)
   * GET /api/users
   */
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userType = req.query.userType as string;

      const result = await this.userRepository.findAll(page, limit, userType);

      res.json({
        success: true,
        data: result.users,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  /**
   * Update user status (admin only)
   * PUT /api/users/:userId/status
   */
  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      await this.userService.updateProfile(userId, { isActive });

      res.json({
        success: true,
        message: `User status updated to ${isActive ? 'active' : 'inactive'}`
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }

  private userRepository = new (require('../repositories/UserRepository').UserRepository)();
}

