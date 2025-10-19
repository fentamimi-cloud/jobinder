import axios from 'axios';
import { 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'employer';
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  agreeToTerms: boolean;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: any;
    token?: string;
  };
  message: string;
}

class AuthService {
  private auth = auth;

  /**
   * Sign up a new user
   * Backend creates both Firebase user and PostgreSQL profile
   */
  async signUp(data: SignUpData): Promise<LoginResponse> {
    try {
      // Call backend to create user in both Firebase and PostgreSQL
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        location: data.location,
        agreeToTerms: data.agreeToTerms,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create account');
      }

      // Now login with the created credentials to get a proper token
      const loginResult = await signInWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      const user = loginResult.user;
      
      // Send email verification
      try {
        await sendEmailVerification(user);
      } catch (verifyError) {
        console.warn('Email verification failed:', verifyError);
      }

      const idToken = await user.getIdToken();

      return {
        success: true,
        data: {
          user: response.data.data.user,
          token: idToken,
        },
        message: response.data.message
      };

    } catch (error: any) {
      console.error('Sign-up error:', error);
      console.error('Error response:', error.response?.data);
      
      let message = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  }

  /**
   * Login existing user
   * 1. Sign in with Firebase
   * 2. Notify backend
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = userCredential.user;

      // Step 2: Get ID token
      const idToken = await user.getIdToken();

      // Step 3: Notify backend and get user profile
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {}, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: {
          user: response.data.data.user,
          token: idToken,
        },
        message: 'Login successful'
      };

    } catch (error: any) {
      console.error('Login error:', error);
      
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email. Please sign up.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return {
        success: false,
        message
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      
      if (user) {
        const idToken = await user.getIdToken();
        
        // Notify backend
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        }).catch(err => console.error('Backend logout notification failed:', err));
      }

      // Sign out from Firebase
      await signOut(this.auth);
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get current user token
   */
  async getCurrentUserToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await sendEmailVerification(user);
  }
}

export const authService = new AuthService();
export default authService;

