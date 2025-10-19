import dotenv from 'dotenv';
import { UserRepository } from '../repositories/UserRepository';
import { closeDatabaseConnection } from './database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

// Sample user IDs (matching seed-sample-data.ts)
const sampleUserIds = [
  'jobseeker_001',
  'jobseeker_002',
  'jobseeker_003',
  'jobseeker_004',
  'jobseeker_005',
  'employer_001',
  'employer_002',
];

async function cleanSampleData() {
  console.log('\n' + '='.repeat(70));
  console.log('🧹 CLEANING SAMPLE DATA');
  console.log('='.repeat(70) + '\n');

  const userRepo = new UserRepository();
  let deletedCount = 0;
  let notFoundCount = 0;

  try {
    for (const userId of sampleUserIds) {
      try {
        const deleted = await userRepo.delete(userId);
        if (deleted) {
          logger.info(`✅ Deleted user: ${userId}`);
          deletedCount++;
        } else {
          logger.warn(`⚠️  User not found: ${userId}`);
          notFoundCount++;
        }
      } catch (error: any) {
        logger.error(`❌ Error deleting ${userId}:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully deleted: ${deletedCount}`);
    console.log(`⚠️  Not found: ${notFoundCount}`);
    console.log('='.repeat(70) + '\n');

    if (deletedCount > 0) {
      console.log('🎉 Sample data cleaned successfully!\n');
    } else {
      console.log('ℹ️  No sample data found to clean.\n');
    }

  } catch (error) {
    logger.error('❌ Error cleaning data:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run cleanup
cleanSampleData();

