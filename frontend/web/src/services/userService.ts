import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: any;
  jobSeekerProfile?: any;
  employerProfile?: any;
  privacy?: any;
  notificationSettings?: any;
}

class UserService {
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData) {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(`${API_BASE_URL}/users/profile`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(profileData: any) {
    try {
      // First update the profile with all the onboarding data
      await this.updateProfile(profileData);

      // Then mark onboarding as complete
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/profile/complete-onboarding`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadAvatar(imageUrl: string) {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/profile/upload-avatar`,
        { imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  /**
   * Upload resume
   */
  async uploadResume(resumeUrl: string) {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/profile/upload-resume`,
        { resumeUrl },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Upload resume error:', error);
      throw error;
    }
  }

  /**
   * Get profile stats
   */
  async getProfileStats() {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Get profile stats error:', error);
      throw error;
    }
  }

  /**
   * Get public profile
   */
  async getPublicProfile(userId: string) {
    try {
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Get public profile error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;

