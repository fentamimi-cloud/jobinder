import { Pool } from 'pg';
import { pool } from '../config/database';
import { EmployerProfile } from '../../../../shared/types/user';
import { logger } from '../../../../shared/utils/logger';

export class EmployerRepository {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    this.pool = dbPool || pool;
  }

  /**
   * Create employer profile
   * @param userId - Firebase UID
   * @param profileData - Employer profile data
   * @returns Created profile
   */
  async createProfile(userId: string, profileData: Partial<EmployerProfile>): Promise<EmployerProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO employer_profiles (
          user_id, company_name, company_size, industry, website,
          description, logo_url, recruiter_name, recruiter_title,
          benefits, company_values, verification_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        userId,
        profileData.companyName,
        profileData.companySize || null,
        profileData.industry || null,
        profileData.website || null,
        profileData.description,
        profileData.logo || null,
        profileData.recruiterName,
        profileData.recruiterTitle,
        profileData.companyBenefits || [],
        profileData.companyValues || [],
        'pending', // Default verification status
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      logger.info('Employer profile created', { userId, company: profileData.companyName });

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating employer profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get employer profile by user ID
   * @param userId - Firebase UID
   * @returns Profile or null if not found
   */
  async getProfile(userId: string): Promise<EmployerProfile | null> {
    try {
      const query = 'SELECT * FROM employer_profiles WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      logger.error('Error getting employer profile:', error);
      throw error;
    }
  }

  /**
   * Update employer profile
   * @param userId - Firebase UID
   * @param updateData - Data to update
   * @returns Updated profile
   */
  async updateProfile(userId: string, updateData: Partial<EmployerProfile>): Promise<EmployerProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.companyName !== undefined) {
        updates.push(`company_name = $${paramCount++}`);
        values.push(updateData.companyName);
      }
      if (updateData.companySize !== undefined) {
        updates.push(`company_size = $${paramCount++}`);
        values.push(updateData.companySize);
      }
      if (updateData.industry !== undefined) {
        updates.push(`industry = $${paramCount++}`);
        values.push(updateData.industry);
      }
      if (updateData.website !== undefined) {
        updates.push(`website = $${paramCount++}`);
        values.push(updateData.website);
      }
      if (updateData.description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(updateData.description);
      }
      if (updateData.logo !== undefined) {
        updates.push(`logo_url = $${paramCount++}`);
        values.push(updateData.logo);
      }
      if (updateData.recruiterName !== undefined) {
        updates.push(`recruiter_name = $${paramCount++}`);
        values.push(updateData.recruiterName);
      }
      if (updateData.recruiterTitle !== undefined) {
        updates.push(`recruiter_title = $${paramCount++}`);
        values.push(updateData.recruiterTitle);
      }
      if (updateData.companyBenefits !== undefined) {
        updates.push(`benefits = $${paramCount++}`);
        values.push(updateData.companyBenefits);
      }
      if (updateData.companyValues !== undefined) {
        updates.push(`company_values = $${paramCount++}`);
        values.push(updateData.companyValues);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(userId);

      const query = `
        UPDATE employer_profiles
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE user_id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Employer profile not found');
      }

      await client.query('COMMIT');

      logger.info('Employer profile updated', { userId, fields: Object.keys(updateData) });

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating employer profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update verification status
   * @param userId - Firebase UID
   * @param status - New verification status
   * @param notes - Optional verification notes
   * @returns Updated profile
   */
  async updateVerificationStatus(
    userId: string,
    status: 'pending' | 'verified' | 'rejected',
    notes?: string
  ): Promise<EmployerProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        UPDATE employer_profiles
        SET verification_status = $1,
            verified_at = ${status === 'verified' ? 'NOW()' : 'NULL'},
            verification_notes = $2,
            updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `;

      const values = [status, notes || null, userId];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Employer profile not found');
      }

      await client.query('COMMIT');

      logger.info('Employer verification status updated', { userId, status });

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating verification status:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all employers with pagination and optional filters
   * @param options - Query options
   * @returns Paginated employers
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    industry?: string;
  } = {}): Promise<{
    employers: EmployerProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      if (options.verificationStatus) {
        conditions.push(`verification_status = $${paramCount++}`);
        params.push(options.verificationStatus);
      }

      if (options.industry) {
        conditions.push(`industry = $${paramCount++}`);
        params.push(options.industry);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM employer_profiles ${whereClause}`;
      const countResult = await this.pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get employers
      const query = `
        SELECT * FROM employer_profiles
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount++} OFFSET $${paramCount}
      `;
      const queryParams = [...params, limit, offset];
      const result = await this.pool.query(query, queryParams);

      const employers = result.rows.map(row => this.mapRowToProfile(row));

      return {
        employers,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching employers:', error);
      throw error;
    }
  }

  /**
   * Get pending verification requests
   * @returns Array of employers pending verification
   */
  async getPendingVerifications(): Promise<EmployerProfile[]> {
    try {
      const query = `
        SELECT * FROM employer_profiles
        WHERE verification_status = 'pending'
        ORDER BY created_at ASC
      `;

      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapRowToProfile(row));
    } catch (error) {
      logger.error('Error getting pending verifications:', error);
      throw error;
    }
  }

  /**
   * Search employers by company name
   * @param searchTerm - Search term
   * @param limit - Max results
   * @returns Array of matching employers
   */
  async searchByCompanyName(searchTerm: string, limit: number = 10): Promise<EmployerProfile[]> {
    try {
      const query = `
        SELECT * FROM employer_profiles
        WHERE company_name ILIKE $1
        ORDER BY 
          CASE WHEN verification_status = 'verified' THEN 1 ELSE 2 END,
          company_name
        LIMIT $2
      `;

      const result = await this.pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows.map(row => this.mapRowToProfile(row));
    } catch (error) {
      logger.error('Error searching employers:', error);
      throw error;
    }
  }

  /**
   * Delete employer profile
   * @param userId - Firebase UID
   * @returns True if deleted
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM employer_profiles WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);

      const deleted = result.rowCount! > 0;
      if (deleted) {
        logger.info('Employer profile deleted', { userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting employer profile:', error);
      throw error;
    }
  }

  /**
   * Check if company name is already used
   * @param companyName - Company name to check
   * @param excludeUserId - User ID to exclude from check (for updates)
   * @returns True if company name exists
   */
  async companyNameExists(companyName: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = 'SELECT EXISTS(SELECT 1 FROM employer_profiles WHERE company_name = $1';
      const params: any[] = [companyName];

      if (excludeUserId) {
        query += ' AND user_id != $2';
        params.push(excludeUserId);
      }

      query += ')';

      const result = await this.pool.query(query, params);
      return result.rows[0].exists;
    } catch (error) {
      logger.error('Error checking company name:', error);
      throw error;
    }
  }

  /**
   * Map database row to EmployerProfile
   */
  private mapRowToProfile(row: any): EmployerProfile {
    return {
      companyName: row.company_name,
      companySize: row.company_size,
      industry: row.industry,
      website: row.website,
      description: row.description,
      logoUrl: row.logo_url,
      verificationStatus: row.verification_status,
      recruiterName: row.recruiter_name,
      recruiterTitle: row.recruiter_title,
      companyBenefits: row.benefits || [],
      companyValues: row.company_values || [],
    };
  }
}

