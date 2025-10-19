import { Location, NotificationSettings, PrivacySettings, Timestamp } from './common';

export interface UserProfile {
  id: string;
  email: string;
  userType: 'job_seeker' | 'employer';
  
  // Personal Information
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  phone?: string;
  location: Location;
  
  // Job Seeker Specific
  jobSeekerProfile?: JobSeekerProfile;
  
  // Employer Specific
  employerProfile?: EmployerProfile;
  
  // System fields
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt?: Timestamp | Date;
  isActive: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  
  // Settings
  privacy: PrivacySettings;
  notificationSettings: NotificationSettings;
}

export interface JobSeekerProfile {
  title: string;
  bio: string;
  resumeUrl?: string;
  skills: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  experienceYears?: number;
  education: Education[];
  preferences: JobSeekerPreferences;
  portfolio?: Portfolio;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  gpa?: number;
  field?: string;
}

export interface JobSeekerPreferences {
  jobTypes: string[];
  industries: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  remoteWork: boolean;
  relocate: boolean;
  workingHours?: 'full_time' | 'part_time' | 'flexible';
}

export interface Portfolio {
  website?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  other?: { [key: string]: string };
}

export interface EmployerProfile {
  companyName: string;
  companySize: string;
  industry: string;
  website?: string;
  description: string;
  logoUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  recruiterName: string;
  recruiterTitle: string;
  companyBenefits?: string[];
  companyValues?: string[];
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'employer';
  location: Location;
  agreeToTerms: boolean;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: Location;
  jobSeekerProfile?: Partial<JobSeekerProfile>;
  employerProfile?: Partial<EmployerProfile>;
  privacy?: Partial<PrivacySettings>;
  notificationSettings?: Partial<NotificationSettings>;
}
