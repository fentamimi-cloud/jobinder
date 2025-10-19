import dotenv from 'dotenv';
import { testDatabaseConnection, closeDatabaseConnection, query } from './database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runTests() {
  logger.info('=== Database Connection Test ===');
  
  try {
    // Test 1: Basic connection
    logger.info('Test 1: Testing basic connection...');
    const connected = await testDatabaseConnection();
    if (!connected) {
      logger.error('❌ Basic connection test failed');
      process.exit(1);
    }
    logger.info('✅ Basic connection test passed');

    // Test 2: Query existing tables
    logger.info('\nTest 2: Querying database tables...');
    const tablesResult = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    logger.info(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row: any) => {
      logger.info(`   - ${row.tablename}`);
    });

    // Test 3: Verify user tables exist
    logger.info('\nTest 3: Verifying user tables...');
    const requiredTables = [
      'users',
      'job_seeker_profiles',
      'job_seeker_education',
      'job_seeker_preferences',
      'employer_profiles'
    ];
    
    const existingTables = tablesResult.rows.map((row: any) => row.tablename);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      logger.error(`❌ Missing tables: ${missingTables.join(', ')}`);
      process.exit(1);
    }
    logger.info('✅ All required user tables exist');

    // Test 4: Test inserting and querying a user
    logger.info('\nTest 4: Testing insert/query operations...');
    const testUserId = `test_${Date.now()}`;
    
    await query(`
      INSERT INTO users (
        id, email, user_type, first_name, last_name,
        location_city, location_state, location_country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testUserId,
      `test_${Date.now()}@example.com`,
      'job_seeker',
      'Test',
      'User',
      'San Francisco',
      'California',
      'United States'
    ]);
    logger.info('✅ Successfully inserted test user');

    const selectResult = await query('SELECT * FROM users WHERE id = $1', [testUserId]);
    if (selectResult.rows.length === 1) {
      logger.info('✅ Successfully queried test user');
    } else {
      logger.error('❌ Failed to query test user');
      process.exit(1);
    }

    // Cleanup: Delete test user
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
    logger.info('✅ Successfully deleted test user');

    logger.info('\n=== All Tests Passed! ===');
    logger.info('Database connection is working correctly.');
    
  } catch (error) {
    logger.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run tests
runTests();

