import { Pool } from 'pg';
import { pool } from '../config/database';
import { JobSeekerProfile, Education, JobSeekerPreferences } from '../../../../shared/types/user';
import { logger } from '../../../../shared/utils/logger';

export class JobSeekerRepository {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    this.pool = dbPool || pool;
  }

  /**
   * Create job seeker profile
   * @param userId - Firebase UID
   * @param profileData - Profile data
   * @returns Created profile
   */
  async createProfile(userId: string, profileData: Partial<JobSeekerProfile>): Promise<JobSeekerProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO job_seeker_profiles (
          user_id, title, bio, resume_url, skills,
          experience_level, experience_years, portfolio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        userId,
        profileData.title || null,
        profileData.bio || null,
        profileData.resumeUrl || null,
        profileData.skills || [],
        profileData.experience?.level || null,
        profileData.experience?.years || null,
        JSON.stringify(profileData.portfolio || {}),
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      logger.info('Job seeker profile created', { userId });

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating job seeker profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get job seeker profile by user ID
   * @param userId - Firebase UID
   * @returns Profile or null if not found
   */
  async getProfile(userId: string): Promise<JobSeekerProfile | null> {
    try {
      const query = 'SELECT * FROM job_seeker_profiles WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      logger.error('Error getting job seeker profile:', error);
      throw error;
    }
  }

  /**
   * Update job seeker profile
   * @param userId - Firebase UID
   * @param updateData - Data to update
   * @returns Updated profile
   */
  async updateProfile(userId: string, updateData: Partial<JobSeekerProfile>): Promise<JobSeekerProfile> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(updateData.title);
      }
      if (updateData.bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(updateData.bio);
      }
      if (updateData.resumeUrl !== undefined) {
        updates.push(`resume_url = $${paramCount++}`);
        values.push(updateData.resumeUrl);
      }
      if (updateData.skills !== undefined) {
        updates.push(`skills = $${paramCount++}`);
        values.push(updateData.skills);
      }
      if (updateData.experience) {
        if (updateData.experience.level !== undefined) {
          updates.push(`experience_level = $${paramCount++}`);
          values.push(updateData.experience.level);
        }
        if (updateData.experience.years !== undefined) {
          updates.push(`experience_years = $${paramCount++}`);
          values.push(updateData.experience.years);
        }
      }
      if (updateData.portfolio !== undefined) {
        updates.push(`portfolio = $${paramCount++}`);
        values.push(JSON.stringify(updateData.portfolio));
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(userId);

      const query = `
        UPDATE job_seeker_profiles
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE user_id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Job seeker profile not found');
      }

      await client.query('COMMIT');

      logger.info('Job seeker profile updated', { userId, fields: Object.keys(updateData) });

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating job seeker profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete job seeker profile
   * @param userId - Firebase UID
   * @returns True if deleted
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM job_seeker_profiles WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);

      const deleted = result.rowCount! > 0;
      if (deleted) {
        logger.info('Job seeker profile deleted', { userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting job seeker profile:', error);
      throw error;
    }
  }

  /**
   * Add education record
   * @param userId - Firebase UID
   * @param education - Education data
   * @returns Created education record
   */
  async addEducation(userId: string, education: Education): Promise<Education & { id: string }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // First, get the job_seeker_profile_id
      const profileResult = await client.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Job seeker profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const query = `
        INSERT INTO job_seeker_education (
          job_seeker_profile_id, degree, institution, field, graduation_year, gpa
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        profileId,
        education.degree,
        education.institution,
        education.field || null,
        education.year,
        education.gpa || null,
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      logger.info('Education added', { userId, degree: education.degree });

      return {
        id: result.rows[0].id,
        degree: result.rows[0].degree,
        institution: result.rows[0].institution,
        field: result.rows[0].field,
        year: result.rows[0].graduation_year,
        gpa: result.rows[0].gpa,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error adding education:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all education records for a user
   * @param userId - Firebase UID
   * @returns Array of education records
   */
  async getEducation(userId: string): Promise<Array<Education & { id: string }>> {
    try {
      const query = `
        SELECT e.*
        FROM job_seeker_education e
        JOIN job_seeker_profiles p ON e.job_seeker_profile_id = p.id
        WHERE p.user_id = $1
        ORDER BY e.graduation_year DESC
      `;

      const result = await this.pool.query(query, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        degree: row.degree,
        institution: row.institution,
        field: row.field,
        year: row.graduation_year,
        gpa: row.gpa,
      }));
    } catch (error) {
      logger.error('Error getting education records:', error);
      throw error;
    }
  }

  /**
   * Delete education record
   * @param educationId - Education record ID
   * @returns True if deleted
   */
  async deleteEducation(educationId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM job_seeker_education WHERE id = $1';
      const result = await this.pool.query(query, [educationId]);

      const deleted = result.rowCount! > 0;
      if (deleted) {
        logger.info('Education deleted', { educationId });
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting education:', error);
      throw error;
    }
  }

  /**
   * Create or update job seeker preferences
   * @param userId - Firebase UID
   * @param preferences - Preferences data
   * @returns Saved preferences
   */
  async savePreferences(userId: string, preferences: JobSeekerPreferences): Promise<JobSeekerPreferences> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get profile ID
      const profileResult = await client.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Job seeker profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Check if preferences already exist
      const existingResult = await client.query(
        'SELECT id FROM job_seeker_preferences WHERE job_seeker_profile_id = $1',
        [profileId]
      );

      let query: string;
      let values: any[];

      if (existingResult.rows.length > 0) {
        // Update existing preferences
        query = `
          UPDATE job_seeker_preferences
          SET job_types = $1, industries = $2, salary_min = $3, salary_max = $4,
              salary_currency = $5, remote_work = $6, willing_to_relocate = $7,
              working_hours = $8, updated_at = NOW()
          WHERE job_seeker_profile_id = $9
          RETURNING *
        `;
        values = [
          preferences.jobTypes || [],
          preferences.industries || [],
          preferences.salaryRange?.min || null,
          preferences.salaryRange?.max || null,
          preferences.salaryRange?.currency || 'USD',
          preferences.remoteWork || false,
          preferences.relocate || false,
          preferences.workingHours || null,
          profileId,
        ];
      } else {
        // Insert new preferences
        query = `
          INSERT INTO job_seeker_preferences (
            job_seeker_profile_id, job_types, industries, salary_min, salary_max,
            salary_currency, remote_work, willing_to_relocate, working_hours
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        values = [
          profileId,
          preferences.jobTypes || [],
          preferences.industries || [],
          preferences.salaryRange?.min || null,
          preferences.salaryRange?.max || null,
          preferences.salaryRange?.currency || 'USD',
          preferences.remoteWork || false,
          preferences.relocate || false,
          preferences.workingHours || null,
        ];
      }

      const result = await client.query(query, values);
      await client.query('COMMIT');

      logger.info('Job seeker preferences saved', { userId });

      return this.mapRowToPreferences(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error saving preferences:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get job seeker preferences
   * @param userId - Firebase UID
   * @returns Preferences or null if not found
   */
  async getPreferences(userId: string): Promise<JobSeekerPreferences | null> {
    try {
      const query = `
        SELECT pref.*
        FROM job_seeker_preferences pref
        JOIN job_seeker_profiles p ON pref.job_seeker_profile_id = p.id
        WHERE p.user_id = $1
      `;

      const result = await this.pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPreferences(result.rows[0]);
    } catch (error) {
      logger.error('Error getting preferences:', error);
      throw error;
    }
  }

  /**
   * Map database row to JobSeekerProfile
   */
  private mapRowToProfile(row: any): JobSeekerProfile {
    return {
      title: row.title,
      bio: row.bio,
      resumeUrl: row.resume_url,
      skills: row.skills || [],
      experienceLevel: row.experience_level || 'entry',
      experienceYears: row.experience_years || 0,
      education: [], // Will be loaded separately if needed
      preferences: {
        jobTypes: [],
        industries: [],
        salaryRange: { min: 0, max: 0, currency: 'USD' },
        remoteWork: false,
        relocate: false,
      }, // Will be loaded separately if needed
      portfolio: row.portfolio || {},
    };
  }

  /**
   * Map database row to JobSeekerPreferences
   */
  private mapRowToPreferences(row: any): JobSeekerPreferences {
    return {
      jobTypes: row.job_types || [],
      industries: row.industries || [],
      salaryRange: {
        min: row.salary_min || 0,
        max: row.salary_max || 0,
        currency: row.salary_currency || 'USD',
      },
      remoteWork: row.remote_work || false,
      relocate: row.willing_to_relocate || false,
      workingHours: row.working_hours,
    };
  }
}

