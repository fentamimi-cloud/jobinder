import { Pool } from 'pg';
import { pool } from '../config/database';
import { UserProfile } from '../../../../shared/types/user';
import { Location } from '../../../../shared/types/common';
import { logger } from '../../../../shared/utils/logger';

export class UserRepository {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    this.pool = dbPool || pool;
  }

  /**
   * Create a new user in the database
   * @param userId - Firebase UID
   * @param userData - User data to insert
   * @returns Created user profile
   */
  async create(userId: string, userData: {
    email: string;
    userType: 'job_seeker' | 'employer' | 'admin';
    firstName: string;
    lastName: string;
    location: Location;
    emailVerified?: boolean;
  }): Promise<UserProfile> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO users (
          id, email, user_type, first_name, last_name,
          location_city, location_state, location_country,
          location_lat, location_lng, email_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        userId,
        userData.email,
        userData.userType,
        userData.firstName,
        userData.lastName,
        userData.location.city,
        userData.location.state,
        userData.location.country,
        userData.location.coordinates?.lat || null,
        userData.location.coordinates?.lng || null,
        userData.emailVerified || false,
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      logger.info('User created successfully', { userId, email: userData.email });
      
      return this.mapRowToUserProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find user by Firebase UID
   * @param userId - Firebase UID
   * @returns User profile or null if not found
   */
  async findById(userId: string): Promise<UserProfile | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await this.pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToUserProfile(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email address
   * @param email - User email
   * @returns User profile or null if not found
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await this.pool.query(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToUserProfile(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param userId - Firebase UID
   * @param updateData - Data to update
   * @returns Updated user profile
   */
  async update(userId: string, updateData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    profilePictureUrl: string;
    location: Location;
    privacySettings: any;
    notificationSettings: any;
    onboardingCompleted: boolean;
    emailVerified: boolean;
  }>): Promise<UserProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.firstName !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(updateData.firstName);
      }
      if (updateData.lastName !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(updateData.lastName);
      }
      if (updateData.phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(updateData.phone);
      }
      if (updateData.profilePictureUrl !== undefined) {
        updates.push(`profile_picture_url = $${paramCount++}`);
        values.push(updateData.profilePictureUrl);
      }
      if (updateData.location) {
        updates.push(`location_city = $${paramCount++}`);
        values.push(updateData.location.city);
        updates.push(`location_state = $${paramCount++}`);
        values.push(updateData.location.state);
        updates.push(`location_country = $${paramCount++}`);
        values.push(updateData.location.country);
        if (updateData.location.coordinates) {
          updates.push(`location_lat = $${paramCount++}`);
          values.push(updateData.location.coordinates.lat);
          updates.push(`location_lng = $${paramCount++}`);
          values.push(updateData.location.coordinates.lng);
        }
      }
      if (updateData.privacySettings !== undefined) {
        updates.push(`privacy_settings = $${paramCount++}`);
        values.push(JSON.stringify(updateData.privacySettings));
      }
      if (updateData.notificationSettings !== undefined) {
        updates.push(`notification_settings = $${paramCount++}`);
        values.push(JSON.stringify(updateData.notificationSettings));
      }
      if (updateData.onboardingCompleted !== undefined) {
        updates.push(`onboarding_completed = $${paramCount++}`);
        values.push(updateData.onboardingCompleted);
      }
      if (updateData.emailVerified !== undefined) {
        updates.push(`email_verified = $${paramCount++}`);
        values.push(updateData.emailVerified);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      // Add userId as last parameter
      values.push(userId);

      const query = `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      await client.query('COMMIT');

      logger.info('User updated successfully', { userId, fields: Object.keys(updateData) });
      
      return this.mapRowToUserProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update last login timestamp
   * @param userId - Firebase UID
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE users
        SET last_login_at = NOW()
        WHERE id = $1
      `;
      await this.pool.query(query, [userId]);
      logger.debug('Updated last login timestamp', { userId });
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Delete user (cascade will delete related records)
   * @param userId - Firebase UID
   * @returns True if deleted, false if not found
   */
  async delete(userId: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = 'DELETE FROM users WHERE id = $1';
      const result = await client.query(query, [userId]);

      await client.query('COMMIT');

      const deleted = result.rowCount! > 0;
      if (deleted) {
        logger.info('User deleted successfully', { userId });
      }

      return deleted;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error deleting user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if user exists by ID
   * @param userId - Firebase UID
   * @returns True if exists
   */
  async exists(userId: string): Promise<boolean> {
    try {
      const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
      const result = await this.pool.query(query, [userId]);
      return result.rows[0].exists;
    } catch (error) {
      logger.error('Error checking user existence:', error);
      throw error;
    }
  }

  /**
   * Check if email is already registered
   * @param email - Email to check
   * @returns True if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
      const result = await this.pool.query(query, [email]);
      return result.rows[0].exists;
    } catch (error) {
      logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Array of user profiles and total count
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await this.pool.query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);

      // Get users
      const query = `
        SELECT * FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const result = await this.pool.query(query, [limit, offset]);

      const users = result.rows.map(row => this.mapRowToUserProfile(row));

      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Map database row to UserProfile type
   * @param row - Database row
   * @returns UserProfile object
   */
  private mapRowToUserProfile(row: any): UserProfile {
    // Build location object with proper typing
    const location: Location = {
      city: row.location_city,
      state: row.location_state,
      country: row.location_country,
    };

    // Only add coordinates if both lat and lng are present
    if (row.location_lat && row.location_lng) {
      location.coordinates = {
        lat: parseFloat(row.location_lat),
        lng: parseFloat(row.location_lng),
      };
    }

    return {
      id: row.id,
      email: row.email,
      userType: row.user_type,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePictureUrl: row.profile_picture_url,
      phone: row.phone,
      location,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      onboardingCompleted: row.onboarding_completed,
      privacy: row.privacy_settings,
      notificationSettings: row.notification_settings,
    };
  }
}

