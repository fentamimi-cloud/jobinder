import dotenv from 'dotenv';
import { UserRepository } from './UserRepository';
import { EmployerRepository } from './EmployerRepository';
import { closeDatabaseConnection } from '../config/database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runTests() {
  logger.info('=== EmployerRepository Test ===\n');

  const userRepo = new UserRepository();
  const employerRepo = new EmployerRepository();

  const testUserId = `test_emp_${Date.now()}`;
  const testEmail = `employer_${Date.now()}@example.com`;

  try {
    // Test 0: Create base user
    logger.info('Test 0: Creating base user...');
    await userRepo.create(testUserId, {
      email: testEmail,
      userType: 'employer',
      firstName: 'Jane',
      lastName: 'Smith',
      location: {
        city: 'Austin',
        state: 'Texas',
        country: 'United States',
      },
    });
    logger.info('✅ Base user created\n');

    // Test 1: Create employer profile
    logger.info('Test 1: Creating employer profile...');
    const profile = await employerRepo.createProfile(testUserId, {
      companyName: 'TechCorp Inc.',
      companySize: '100-500',
      industry: 'Technology',
      website: 'https://techcorp.com',
      description: 'Leading technology company building innovative solutions',
      recruiterName: 'Jane Smith',
      recruiterTitle: 'Head of Talent Acquisition',
      companyBenefits: ['Health Insurance', '401k', 'Remote Work', 'Flexible Hours'],
      companyValues: ['Innovation', 'Diversity', 'Sustainability'],
    });

    logger.info('✅ Employer profile created:', {
      company: profile.companyName,
      status: profile.verificationStatus,
      benefits: profile.companyBenefits?.length,
    });

    // Test 2: Get profile
    logger.info('\nTest 2: Getting employer profile...');
    const retrievedProfile = await employerRepo.getProfile(testUserId);
    if (retrievedProfile && retrievedProfile.companyName === 'TechCorp Inc.') {
      logger.info('✅ Profile retrieved successfully');
    } else {
      throw new Error('Failed to retrieve profile');
    }

    // Test 3: Update profile
    logger.info('\nTest 3: Updating employer profile...');
    const updatedProfile = await employerRepo.updateProfile(testUserId, {
      description: 'Updated: Award-winning technology company specializing in AI and ML',
      companySize: '500-1000',
      companyBenefits: [
        'Health Insurance',
        '401k',
        'Remote Work',
        'Flexible Hours',
        'Stock Options',
        'Learning Budget',
      ],
    });

    if (updatedProfile.companyBenefits?.length === 6) {
      logger.info('✅ Profile updated:', {
        size: updatedProfile.companySize,
        benefitsCount: updatedProfile.companyBenefits?.length,
      });
    } else {
      throw new Error('Profile update failed');
    }

    // Test 4: Check company name exists
    logger.info('\nTest 4: Checking if company name exists...');
    const exists = await employerRepo.companyNameExists('TechCorp Inc.');
    if (exists) {
      logger.info('✅ Company name exists check passed');
    } else {
      throw new Error('Company name should exist');
    }

    // Test 5: Check company name doesn't exist
    logger.info('\nTest 5: Checking non-existent company name...');
    const notExists = await employerRepo.companyNameExists('NonExistentCorp');
    if (!notExists) {
      logger.info('✅ Non-existent company check passed');
    } else {
      throw new Error('Company name should not exist');
    }

    // Test 6: Update verification status to verified
    logger.info('\nTest 6: Updating verification status to verified...');
    const verifiedProfile = await employerRepo.updateVerificationStatus(
      testUserId,
      'verified',
      'Company verified through business registration documents'
    );

    if (verifiedProfile.verificationStatus === 'verified') {
      logger.info('✅ Verification status updated:', {
        status: verifiedProfile.verificationStatus,
      });
    } else {
      throw new Error('Verification status update failed');
    }

    // Test 7: Create another employer for testing search/list
    logger.info('\nTest 7: Creating second employer for search tests...');
    const testUserId2 = `test_emp2_${Date.now()}`;
    const testEmail2 = `employer2_${Date.now()}@example.com`;

    await userRepo.create(testUserId2, {
      email: testEmail2,
      userType: 'employer',
      firstName: 'Bob',
      lastName: 'Johnson',
      location: {
        city: 'Seattle',
        state: 'Washington',
        country: 'United States',
      },
    });

    await employerRepo.createProfile(testUserId2, {
      companyName: 'StartupXYZ',
      companySize: '10-50',
      industry: 'Technology',
      website: 'https://startupxyz.com',
      description: 'Innovative startup disrupting the fintech space',
      recruiterName: 'Bob Johnson',
      recruiterTitle: 'CEO & Founder',
      companyBenefits: ['Equity', 'Remote Work', 'Unlimited PTO'],
      companyValues: ['Speed', 'Innovation', 'Customer Focus'],
    });
    logger.info('✅ Second employer created');

    // Test 8: Search by company name
    logger.info('\nTest 8: Searching employers by company name...');
    const searchResults = await employerRepo.searchByCompanyName('Tech');
    if (searchResults.length > 0) {
      logger.info('✅ Search returned results:', {
        count: searchResults.length,
        companies: searchResults.map(e => e.companyName),
      });
    } else {
      throw new Error('Search should return results');
    }

    // Test 9: Get all employers with pagination
    logger.info('\nTest 9: Getting all employers with pagination...');
    const allEmployers = await employerRepo.findAll({ page: 1, limit: 10 });
    if (allEmployers.total >= 2) {
      logger.info('✅ Pagination working:', {
        total: allEmployers.total,
        page: allEmployers.page,
        count: allEmployers.employers.length,
      });
    } else {
      throw new Error('Should have at least 2 employers');
    }

    // Test 10: Filter by verification status
    logger.info('\nTest 10: Filtering by verification status...');
    const verifiedEmployers = await employerRepo.findAll({
      verificationStatus: 'verified',
      page: 1,
      limit: 10,
    });

    if (verifiedEmployers.total >= 1) {
      logger.info('✅ Verified employers filter working:', {
        verifiedCount: verifiedEmployers.total,
      });
    }

    const pendingEmployers = await employerRepo.findAll({
      verificationStatus: 'pending',
      page: 1,
      limit: 10,
    });

    if (pendingEmployers.total >= 1) {
      logger.info('✅ Pending employers filter working:', {
        pendingCount: pendingEmployers.total,
      });
    }

    // Test 11: Get pending verifications
    logger.info('\nTest 11: Getting pending verification requests...');
    const pendingVerifications = await employerRepo.getPendingVerifications();
    if (pendingVerifications.length >= 1) {
      logger.info('✅ Pending verifications retrieved:', {
        count: pendingVerifications.length,
        companies: pendingVerifications.map(e => e.companyName),
      });
    }

    // Test 12: Filter by industry
    logger.info('\nTest 12: Filtering by industry...');
    const techEmployers = await employerRepo.findAll({
      industry: 'Technology',
      page: 1,
      limit: 10,
    });

    if (techEmployers.total >= 2) {
      logger.info('✅ Industry filter working:', {
        techCount: techEmployers.total,
      });
    } else {
      throw new Error('Should have 2 technology companies');
    }

    // Cleanup
    logger.info('\nCleanup: Deleting test employers...');
    await employerRepo.deleteProfile(testUserId);
    await employerRepo.deleteProfile(testUserId2);
    await userRepo.delete(testUserId);
    await userRepo.delete(testUserId2);
    logger.info('✅ Test data cleaned up');

    logger.info('\n=== All Tests Passed! ===');
    logger.info('EmployerRepository is working correctly.');

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

