import { Request, Response } from 'express';
import { logger } from '../../../../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    customClaims?: any;
  };
}

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      
      // For now, return a mock profile
      const mockProfile = {
        id: userId,
        email: req.user!.email,
        firstName: 'John',
        lastName: 'Doe',
        userType: 'job_seeker',
        location: {
          city: 'San Francisco',
          state: 'California',
          country: 'United States'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: req.user!.emailVerified,
        onboardingCompleted: false,
        privacy: {
          profileVisibility: 'public',
          showLocation: true,
          showContact: false
        },
        notificationSettings: {
          email: true,
          push: true,
          sms: false,
          matches: true,
          messages: true,
          meetings: true
        }
      };

      res.json({
        success: true,
        data: mockProfile
      });
    } catch (error) {
      logger.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const updateData = req.body;
      
      logger.info(`Updating profile for user ${userId}:`, updateData);
      
      // For now, return the updated data as-is
      res.json({
        success: true,
        data: updateData,
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

  async register(req: Request, res: Response): Promise<void> {
    try {
      const registrationData = req.body;
      
      logger.info('User registration attempt:', { 
        email: registrationData.email,
        userType: registrationData.userType 
      });
      
      // For now, return a mock success response
      const mockUser = {
        id: `user_${Date.now()}`,
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        userType: registrationData.userType,
        location: registrationData.location,
        createdAt: new Date(),
        isActive: true,
        emailVerified: false,
        onboardingCompleted: false
      };
      
      res.status(201).json({
        success: true,
        data: mockUser,
        message: 'User registered successfully'
      });
    } catch (error) {
      logger.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      logger.info(`Getting public profile for user: ${userId}`);
      
      // Mock public profile
      const mockProfile = {
        id: userId,
        firstName: 'Jane',
        lastName: 'Smith',
        userType: 'job_seeker',
        location: {
          city: 'New York',
          state: 'New York',
          country: 'United States'
        },
        jobSeekerProfile: {
          title: 'Software Engineer',
          bio: 'Passionate full-stack developer with 5 years of experience.',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: {
            level: 'mid',
            years: 5
          }
        }
      };

      res.json({
        success: true,
        data: mockProfile
      });
    } catch (error) {
      logger.error('Error getting public profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  async deleteProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      
      logger.info(`Deleting profile for user: ${userId}`);
      
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

  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      logger.info('Admin getting all users');
      
      // Mock users list
      const mockUsers = [
        {
          id: 'user_1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          userType: 'job_seeker',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'user_2',
          email: 'jane@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          userType: 'employer',
          isActive: true,
          createdAt: new Date()
        }
      ];

      res.json({
        success: true,
        data: mockUsers,
        meta: {
          total: mockUsers.length,
          page: 1,
          limit: 10
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

  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      logger.info(`Admin updating user ${userId} status to: ${isActive}`);
      
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
}
