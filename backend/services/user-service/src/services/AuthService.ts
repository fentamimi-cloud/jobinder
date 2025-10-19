import { auth } from '../../../../shared/config/firebase';
import { UserRepository } from '../repositories/UserRepository';
import { JobSeekerRepository } from '../repositories/JobSeekerRepository';
import { EmployerRepository } from '../repositories/EmployerRepository';
import { logger } from '../../../../shared/utils/logger';
import { Location } from '../../../../shared/types/common';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'employer';
  location: Location;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    token: string;
    refreshToken?: string;
  };
  message: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private jobSeekerRepository: JobSeekerRepository;
  private employerRepository: EmployerRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.jobSeekerRepository = new JobSeekerRepository();
    this.employerRepository = new EmployerRepository();
  }

  /**
   * Sign up a new user
   * Creates user in both Firebase Authentication and PostgreSQL
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      logger.info('Starting sign-up process:', { email: data.email, userType: data.userType });

      // Step 1: Check if email already exists in database
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      // Step 2: Create user in Firebase Authentication
      let firebaseUser;
      try {
        firebaseUser = await auth.createUser({
          email: data.email,
          password: data.password,
          displayName: `${data.firstName} ${data.lastName}`,
          emailVerified: false, // Will be verified via email link
        });

        logger.info('Firebase user created:', { uid: firebaseUser.uid, email: data.email });
      } catch (firebaseError: any) {
        logger.error('Firebase user creation failed:', firebaseError);
        
        if (firebaseError.code === 'auth/email-already-exists') {
          return {
            success: false,
            message: 'Email already registered in authentication system'
          };
        }
        
        throw new Error('Failed to create authentication account');
      }

      // Step 3: Create user profile in PostgreSQL
      try {
        const user = await this.userRepository.create(firebaseUser.uid, {
          email: data.email,
          userType: data.userType,
          firstName: data.firstName,
          lastName: data.lastName,
          location: data.location,
          emailVerified: false,
        });

        logger.info('User profile created in database:', { userId: user.id });

        // Step 4: Create role-specific profile
        if (data.userType === 'job_seeker') {
          await this.jobSeekerRepository.createProfile(firebaseUser.uid, {
            title: '',
            bio: '',
            skills: [],
            experience: { level: 'entry', years: 0 },
          });
          logger.info('Job seeker profile created');
        } else if (data.userType === 'employer') {
          await this.employerRepository.createProfile(firebaseUser.uid, {
            companyName: '',
            industry: '',
            description: '',
          });
          logger.info('Employer profile created');
        }

        // Step 5: Set custom claims for role-based access
        await auth.setCustomUserClaims(firebaseUser.uid, {
          userType: data.userType,
        });

        // Step 6: Generate custom token for immediate login
        const customToken = await auth.createCustomToken(firebaseUser.uid, {
          userType: data.userType,
        });

        // Step 7: Send verification email (handled by Firebase client SDK)
        // The client will use sendEmailVerification()

        return {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              userType: user.userType,
              emailVerified: user.emailVerified,
              onboardingCompleted: user.onboardingCompleted,
            },
            token: customToken,
          },
          message: 'Account created successfully. Please verify your email.'
        };

      } catch (dbError) {
        // Rollback: Delete Firebase user if database creation failed
        logger.error('Database user creation failed, rolling back Firebase user:', dbError);
        try {
          await auth.deleteUser(firebaseUser.uid);
          logger.info('Firebase user rolled back successfully');
        } catch (rollbackError) {
          logger.error('Failed to rollback Firebase user:', rollbackError);
        }
        
        throw new Error('Failed to create user profile');
      }

    } catch (error) {
      logger.error('Sign-up process failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Verify user login and update last login time
   */
  async login(uid: string): Promise<AuthResponse> {
    try {
      logger.info('Processing login:', { uid });

      // Get user from database
      const user = await this.userRepository.findById(uid);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is suspended. Please contact support.'
        };
      }

      // Update last login time
      await this.userRepository.updateLastLogin(uid);

      logger.info('Login successful:', { uid, email: user.email });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            emailVerified: user.emailVerified,
            onboardingCompleted: user.onboardingCompleted,
            location: user.location,
          },
          token: '', // Token is already provided by client via Firebase SDK
        },
        message: 'Login successful'
      };

    } catch (error) {
      logger.error('Login process failed:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(uid: string): Promise<AuthResponse> {
    try {
      logger.info('Verifying email for user:', { uid });

      // Update user in Firebase
      await auth.updateUser(uid, {
        emailVerified: true,
      });

      // Update user in database
      const user = await this.userRepository.update(uid, {
        emailVerified: true,
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      logger.info('Email verified successfully:', { uid });

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      logger.error('Email verification failed:', error);
      return {
        success: false,
        message: 'Email verification failed'
      };
    }
  }

  /**
   * Delete user account (from both Firebase and PostgreSQL)
   */
  async deleteAccount(uid: string): Promise<AuthResponse> {
    try {
      logger.info('Deleting user account:', { uid });

      // Delete from PostgreSQL first (will cascade to profiles)
      await this.userRepository.delete(uid);

      // Delete from Firebase
      await auth.deleteUser(uid);

      logger.info('User account deleted successfully:', { uid });

      return {
        success: true,
        message: 'Account deleted successfully'
      };

    } catch (error) {
      logger.error('Account deletion failed:', error);
      return {
        success: false,
        message: 'Failed to delete account'
      };
    }
  }

  /**
   * Get user by UID
   */
  async getUserByUid(uid: string) {
    try {
      return await this.userRepository.findById(uid);
    } catch (error) {
      logger.error('Error getting user by UID:', error);
      throw error;
    }
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(uid: string, verified: boolean): Promise<void> {
    try {
      await this.userRepository.update(uid, { emailVerified: verified });
      logger.info('Email verification status updated:', { uid, verified });
    } catch (error) {
      logger.error('Failed to update email verification:', error);
      throw error;
    }
  }
}

