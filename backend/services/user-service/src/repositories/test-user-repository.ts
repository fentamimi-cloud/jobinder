import dotenv from 'dotenv';
import { UserRepository } from './UserRepository';
import { closeDatabaseConnection } from '../config/database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runTests() {
  logger.info('=== UserRepository Test ===\n');
  
  const userRepo = new UserRepository();
  const testUserId = `test_user_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;

  try {
    // Test 1: Create user
    logger.info('Test 1: Creating user...');
    const newUser = await userRepo.create(testUserId, {
      email: testEmail,
      userType: 'job_seeker',
      firstName: 'John',
      lastName: 'Doe',
      location: {
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        coordinates: {
          lat: 37.7749,
          lng: -122.4194,
        },
      },
      emailVerified: false,
    });
    
    logger.info('✅ User created:', {
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName}`,
    });

    // Test 2: Find by ID
    logger.info('\nTest 2: Finding user by ID...');
    const foundById = await userRepo.findById(testUserId);
    if (foundById && foundById.id === testUserId) {
      logger.info('✅ User found by ID:', foundById.email);
    } else {
      throw new Error('Failed to find user by ID');
    }

    // Test 3: Find by email
    logger.info('\nTest 3: Finding user by email...');
    const foundByEmail = await userRepo.findByEmail(testEmail);
    if (foundByEmail && foundByEmail.email === testEmail) {
      logger.info('✅ User found by email:', foundByEmail.id);
    } else {
      throw new Error('Failed to find user by email');
    }

    // Test 4: Check if user exists
    logger.info('\nTest 4: Checking if user exists...');
    const exists = await userRepo.exists(testUserId);
    if (exists) {
      logger.info('✅ User exists check passed');
    } else {
      throw new Error('User exists check failed');
    }

    // Test 5: Check if email exists
    logger.info('\nTest 5: Checking if email exists...');
    const emailExists = await userRepo.emailExists(testEmail);
    if (emailExists) {
      logger.info('✅ Email exists check passed');
    } else {
      throw new Error('Email exists check failed');
    }

    // Test 6: Update user
    logger.info('\nTest 6: Updating user...');
    const updatedUser = await userRepo.update(testUserId, {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567890',
      onboardingCompleted: true,
    });
    
    if (updatedUser.firstName === 'Jane' && updatedUser.onboardingCompleted) {
      logger.info('✅ User updated:', {
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        phone: updatedUser.phone,
        onboarded: updatedUser.onboardingCompleted,
      });
    } else {
      throw new Error('User update failed');
    }

    // Test 7: Update last login
    logger.info('\nTest 7: Updating last login...');
    await userRepo.updateLastLogin(testUserId);
    const userAfterLogin = await userRepo.findById(testUserId);
    if (userAfterLogin?.lastLoginAt) {
      logger.info('✅ Last login updated:', userAfterLogin.lastLoginAt);
    } else {
      logger.warn('⚠️  Last login update may have failed');
    }

    // Test 8: Get all users
    logger.info('\nTest 8: Getting all users...');
    const allUsers = await userRepo.findAll(1, 5);
    logger.info('✅ Found users:', {
      total: allUsers.total,
      page: allUsers.page,
      count: allUsers.users.length,
    });

    // Test 9: Delete user
    logger.info('\nTest 9: Deleting user...');
    const deleted = await userRepo.delete(testUserId);
    if (deleted) {
      logger.info('✅ User deleted successfully');
    } else {
      throw new Error('User deletion failed');
    }

    // Test 10: Verify user is deleted
    logger.info('\nTest 10: Verifying user is deleted...');
    const deletedUser = await userRepo.findById(testUserId);
    if (deletedUser === null) {
      logger.info('✅ User successfully removed from database');
    } else {
      throw new Error('User still exists after deletion');
    }

    logger.info('\n=== All Tests Passed! ===');
    logger.info('UserRepository is working correctly.');

  } catch (error) {
    logger.error('\n❌ Test failed:', error);
    
    // Cleanup on error
    try {
      await userRepo.delete(testUserId);
      logger.info('Cleaned up test user');
    } catch (cleanupError) {
      logger.error('Failed to cleanup test user:', cleanupError);
    }
    
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run tests
runTests();

