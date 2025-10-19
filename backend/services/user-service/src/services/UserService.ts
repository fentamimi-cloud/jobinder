import { UserRepository } from '../repositories/UserRepository';
import { JobSeekerRepository } from '../repositories/JobSeekerRepository';
import { EmployerRepository } from '../repositories/EmployerRepository';
import { logger } from '../../../../shared/utils/logger';
import { UserProfile } from '../../../../shared/types/user';

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  profilePictureUrl?: string;
}

interface JobSeekerProfileData {
  title?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  experienceYears?: number;
  resumeUrl?: string;
}

interface EmployerProfileData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  recruiterName?: string;
  recruiterTitle?: string;
}

export class UserService {
  private userRepository: UserRepository;
  private jobSeekerRepository: JobSeekerRepository;
  private employerRepository: EmployerRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.jobSeekerRepository = new JobSeekerRepository();
    this.employerRepository = new EmployerRepository();
  }

  /**
   * Get complete user profile with role-specific data
   */
  async getCompleteProfile(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return null;
      }

      let profileData: any = {};

      // Get role-specific profile
      if (user.userType === 'job_seeker') {
        const jobSeekerProfile = await this.jobSeekerRepository.getProfile(userId);
        if (jobSeekerProfile) {
          profileData.jobSeekerProfile = jobSeekerProfile;
        }
      } else if (user.userType === 'employer') {
        const employerProfile = await this.employerRepository.getProfile(userId);
        if (employerProfile) {
          profileData.employerProfile = employerProfile;
        }
      }

      return {
        ...user,
        ...profileData,
        profileCompletionPercentage: this.calculateProfileCompletion(user, profileData)
      };

    } catch (error) {
      logger.error('Error getting complete profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: ProfileUpdateData) {
    try {
      const updatedUser = await this.userRepository.update(userId, data);
      logger.info('Profile updated:', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Update job seeker profile
   */
  async updateJobSeekerProfile(userId: string, data: JobSeekerProfileData) {
    try {
      const profile = await this.jobSeekerRepository.updateProfile(userId, data);
      logger.info('Job seeker profile updated:', { userId });
      return profile;
    } catch (error) {
      logger.error('Error updating job seeker profile:', error);
      throw error;
    }
  }

  /**
   * Update employer profile
   */
  async updateEmployerProfile(userId: string, data: EmployerProfileData) {
    try {
      const profile = await this.employerRepository.updateProfile(userId, data);
      logger.info('Employer profile updated:', { userId });
      return profile;
    } catch (error) {
      logger.error('Error updating employer profile:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string) {
    try {
      await this.userRepository.update(userId, { onboardingCompleted: true });
      logger.info('Onboarding completed:', { userId });
      return { success: true, message: 'Onboarding completed successfully' };
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId: string, pictureUrl: string) {
    try {
      await this.userRepository.update(userId, { profilePictureUrl: pictureUrl });
      logger.info('Profile picture updated:', { userId, pictureUrl });
      return { success: true, url: pictureUrl };
    } catch (error) {
      logger.error('Error updating profile picture:', error);
      throw error;
    }
  }

  /**
   * Update resume
   */
  async updateResume(userId: string, resumeUrl: string) {
    try {
      await this.jobSeekerRepository.updateProfile(userId, { resumeUrl });
      logger.info('Resume updated:', { userId, resumeUrl });
      return { success: true, url: resumeUrl };
    } catch (error) {
      logger.error('Error updating resume:', error);
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(userId: string, settings: any) {
    try {
      await this.userRepository.update(userId, { privacySettings: settings });
      logger.info('Privacy settings updated:', { userId });
      return { success: true, settings };
    } catch (error) {
      logger.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, settings: any) {
    try {
      await this.userRepository.update(userId, { notificationSettings: settings });
      logger.info('Notification settings updated:', { userId });
      return { success: true, settings };
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(user: UserProfile, profileData: any): number {
    let completedFields = 0;
    let totalFields = 0;

    // Basic user fields (30%)
    const basicFields = [
      user.firstName,
      user.lastName,
      user.email,
      user.location?.city,
      user.location?.country
    ];
    totalFields += basicFields.length;
    completedFields += basicFields.filter(field => field && field.length > 0).length;

    // Profile picture (10%)
    if (user.profilePictureUrl) {
      completedFields += 2;
    }
    totalFields += 2;

    // Phone (5%)
    if (user.phone) {
      completedFields += 1;
    }
    totalFields += 1;

    // Role-specific fields (55%)
    if (user.userType === 'job_seeker' && profileData.jobSeekerProfile) {
      const profile = profileData.jobSeekerProfile;
      const jobSeekerFields = [
        profile.title,
        profile.bio,
        profile.skills?.length > 0,
        profile.experienceLevel,
        profile.resumeUrl,
      ];
      totalFields += jobSeekerFields.length * 2; // Weight these more
      completedFields += jobSeekerFields.filter(field => field).length * 2;
      
    } else if (user.userType === 'employer' && profileData.employerProfile) {
      const profile = profileData.employerProfile;
      const employerFields = [
        profile.companyName,
        profile.industry,
        profile.description,
        profile.website,
        profile.logoUrl,
      ];
      totalFields += employerFields.length * 2;
      completedFields += employerFields.filter(field => field).length * 2;
    }

    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Get public profile (limited data)
   */
  async getPublicProfile(userId: string) {
    try {
      const profile = await this.getCompleteProfile(userId);
      
      if (!profile) {
        return null;
      }

      // Check privacy settings
      if (profile.privacy?.profileVisibility === 'private') {
        return {
          id: profile.id,
          firstName: profile.firstName,
          userType: profile.userType,
          message: 'This profile is private'
        };
      }

      // Return public-safe data
      const publicData: any = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        userType: profile.userType,
        profilePictureUrl: profile.profilePictureUrl,
      };

      if (profile.privacy?.showLocation !== false) {
        publicData.location = profile.location;
      }

      if (profile.userType === 'job_seeker' && profile.jobSeekerProfile) {
        publicData.jobSeekerProfile = {
          title: profile.jobSeekerProfile.title,
          bio: profile.jobSeekerProfile.bio,
          skills: profile.jobSeekerProfile.skills,
          experienceLevel: profile.jobSeekerProfile.experienceLevel,
        };
      } else if (profile.userType === 'employer' && profile.employerProfile) {
        publicData.employerProfile = {
          companyName: profile.employerProfile.companyName,
          industry: profile.employerProfile.industry,
          companySize: profile.employerProfile.companySize,
          logoUrl: profile.employerProfile.logoUrl,
        };
      }

      return publicData;

    } catch (error) {
      logger.error('Error getting public profile:', error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string) {
    try {
      await this.userRepository.delete(userId);
      logger.info('Profile deleted:', { userId });
      return { success: true, message: 'Profile deleted successfully' };
    } catch (error) {
      logger.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return null;
      }

      return {
        memberSince: user.createdAt,
        lastActive: user.lastLoginAt,
        profileCompletion: this.calculateProfileCompletion(user, {}),
        isVerified: user.emailVerified,
        accountStatus: user.isActive ? 'active' : 'suspended'
      };

    } catch (error) {
      logger.error('Error getting profile stats:', error);
      throw error;
    }
  }
}

