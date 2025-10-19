import dotenv from 'dotenv';
import { UserRepository } from './UserRepository';
import { JobSeekerRepository } from './JobSeekerRepository';
import { closeDatabaseConnection } from '../config/database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runTests() {
  logger.info('=== JobSeekerRepository Test ===\n');

  const userRepo = new UserRepository();
  const jobSeekerRepo = new JobSeekerRepository();
  
  const testUserId = `test_js_${Date.now()}`;
  const testEmail = `jobseeker_${Date.now()}@example.com`;

  try {
    // Test 0: Create a user first
    logger.info('Test 0: Creating base user...');
    await userRepo.create(testUserId, {
      email: testEmail,
      userType: 'job_seeker',
      firstName: 'Alice',
      lastName: 'Johnson',
      location: {
        city: 'New York',
        state: 'New York',
        country: 'United States',
      },
    });
    logger.info('✅ Base user created\n');

    // Test 1: Create job seeker profile
    logger.info('Test 1: Creating job seeker profile...');
    const profile = await jobSeekerRepo.createProfile(testUserId, {
      title: 'Senior Software Engineer',
      bio: 'Passionate about building scalable web applications',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      experience: {
        level: 'senior',
        years: 8,
      },
      portfolio: {
        github: 'https://github.com/alice',
        linkedin: 'https://linkedin.com/in/alice',
      },
    });
    
    logger.info('✅ Job seeker profile created:', {
      title: profile.title,
      skills: profile.skills?.length,
      experience: profile.experience,
    });

    // Test 2: Get profile
    logger.info('\nTest 2: Getting job seeker profile...');
    const retrievedProfile = await jobSeekerRepo.getProfile(testUserId);
    if (retrievedProfile && retrievedProfile.title === 'Senior Software Engineer') {
      logger.info('✅ Profile retrieved successfully');
    } else {
      throw new Error('Failed to retrieve profile');
    }

    // Test 3: Update profile
    logger.info('\nTest 3: Updating job seeker profile...');
    const updatedProfile = await jobSeekerRepo.updateProfile(testUserId, {
      bio: 'Updated bio - Full-stack developer with cloud expertise',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
    });
    
    if (updatedProfile.skills?.length === 6) {
      logger.info('✅ Profile updated:', {
        bio: updatedProfile.bio?.substring(0, 50) + '...',
        skillCount: updatedProfile.skills?.length,
      });
    } else {
      throw new Error('Profile update failed');
    }

    // Test 4: Add education records
    logger.info('\nTest 4: Adding education records...');
    const edu1 = await jobSeekerRepo.addEducation(testUserId, {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'MIT',
      field: 'Computer Science',
      year: 2015,
      gpa: 3.8,
    });
    logger.info('✅ Education 1 added:', edu1.degree);

    const edu2 = await jobSeekerRepo.addEducation(testUserId, {
      degree: 'Master of Science in Software Engineering',
      institution: 'Stanford University',
      field: 'Software Engineering',
      year: 2017,
      gpa: 3.9,
    });
    logger.info('✅ Education 2 added:', edu2.degree);

    // Test 5: Get all education
    logger.info('\nTest 5: Getting all education records...');
    const education = await jobSeekerRepo.getEducation(testUserId);
    if (education.length === 2) {
      logger.info('✅ Education records retrieved:', {
        count: education.length,
        degrees: education.map(e => e.degree),
      });
    } else {
      throw new Error('Expected 2 education records');
    }

    // Test 6: Save preferences
    logger.info('\nTest 6: Saving job seeker preferences...');
    const preferences = await jobSeekerRepo.savePreferences(testUserId, {
      jobTypes: ['full_time', 'contract'],
      industries: ['Technology', 'Finance', 'Healthcare'],
      salaryRange: {
        min: 150000,
        max: 200000,
        currency: 'USD',
      },
      remoteWork: true,
      relocate: false,
      workingHours: 'flexible',
    });
    
    logger.info('✅ Preferences saved:', {
      jobTypes: preferences.jobTypes,
      salaryRange: `$${preferences.salaryRange.min}-$${preferences.salaryRange.max}`,
      remoteWork: preferences.remoteWork,
    });

    // Test 7: Get preferences
    logger.info('\nTest 7: Getting preferences...');
    const retrievedPrefs = await jobSeekerRepo.getPreferences(testUserId);
    if (retrievedPrefs && retrievedPrefs.industries.length === 3) {
      logger.info('✅ Preferences retrieved:', {
        industries: retrievedPrefs.industries,
        remote: retrievedPrefs.remoteWork,
      });
    } else {
      throw new Error('Failed to retrieve preferences');
    }

    // Test 8: Update preferences
    logger.info('\nTest 8: Updating preferences...');
    const updatedPrefs = await jobSeekerRepo.savePreferences(testUserId, {
      jobTypes: ['full_time'],
      industries: ['Technology', 'Startups'],
      salaryRange: {
        min: 180000,
        max: 250000,
        currency: 'USD',
      },
      remoteWork: true,
      relocate: true,
      workingHours: 'full_time',
    });
    
    if (updatedPrefs.relocate === true && updatedPrefs.industries.length === 2) {
      logger.info('✅ Preferences updated:', {
        industries: updatedPrefs.industries,
        relocate: updatedPrefs.relocate,
      });
    } else {
      throw new Error('Preferences update failed');
    }

    // Test 9: Delete education
    logger.info('\nTest 9: Deleting one education record...');
    const deleted = await jobSeekerRepo.deleteEducation(edu1.id);
    if (deleted) {
      logger.info('✅ Education deleted');
      
      const remainingEdu = await jobSeekerRepo.getEducation(testUserId);
      if (remainingEdu.length === 1) {
        logger.info('✅ Verified: 1 education record remains');
      }
    } else {
      throw new Error('Failed to delete education');
    }

    // Cleanup: Delete profile (cascade will delete education and preferences)
    logger.info('\nCleanup: Deleting job seeker profile...');
    await jobSeekerRepo.deleteProfile(testUserId);
    logger.info('✅ Profile deleted');

    // Delete base user
    await userRepo.delete(testUserId);
    logger.info('✅ User deleted');

    logger.info('\n=== All Tests Passed! ===');
    logger.info('JobSeekerRepository is working correctly.');

  } catch (error) {
    logger.error('\n❌ Test failed:', error);

    // Cleanup on error
    try {
      await userRepo.delete(testUserId);
      logger.info('Cleaned up test user');
    } catch (cleanupError) {
      logger.error('Failed to cleanup:', cleanupError);
    }

    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run tests
runTests();

