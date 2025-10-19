import { Pool, PoolConfig } from 'pg';
import { logger } from '../../../../shared/utils/logger';

// Database configuration
const poolConfig: PoolConfig = {
  connectionString: process.env['DATABASE_URL'] || 'postgresql://jobinder:password@localhost:5432/jobinder_dev',
  max: parseInt(process.env['DATABASE_POOL_MAX'] || '20', 10), // Maximum number of connections in pool
  min: parseInt(process.env['DATABASE_POOL_MIN'] || '5', 10),  // Minimum number of connections in pool
  idleTimeoutMillis: 30000, // How long a client can be idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Event handlers for pool monitoring
pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected to pool');
});

pool.on('acquire', () => {
  logger.debug('Client acquired from pool');
});

pool.on('remove', () => {
  logger.debug('Client removed from pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client:', err);
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database');
    logger.info('Database connection successful:', {
      database: result.rows[0].database,
      serverTime: result.rows[0].current_time,
      poolMax: poolConfig.max,
      poolMin: poolConfig.min,
    });
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection pool:', error);
  }
}

// Helper function to execute queries with error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error });
    throw error;
  }
}

export default pool;

