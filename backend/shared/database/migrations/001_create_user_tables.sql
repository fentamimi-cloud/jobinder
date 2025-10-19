-- Migration 001: Create User Tables
-- Description: Creates core user tables for authentication and profiles
-- Author: Jobinder Team
-- Date: 2025-10-16

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,  -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('job_seeker', 'employer', 'admin')),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture_url TEXT,
    phone VARCHAR(20),
    
    -- Location
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Settings (JSONB for flexibility)
    privacy_settings JSONB DEFAULT '{"profileVisibility": "public", "showLocation": true, "showContact": false}'::jsonb,
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false, "matches": true, "messages": true, "meetings": true}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_city, location_country);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================================
-- JOB SEEKER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile Information
    title VARCHAR(200),
    bio TEXT,
    resume_url TEXT,
    skills TEXT[],  -- Array of skills
    
    -- Experience
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    experience_years INTEGER CHECK (experience_years >= 0),
    
    -- Portfolio Links (JSONB for flexibility)
    portfolio JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_seeker_user_id ON job_seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_skills ON job_seeker_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_job_seeker_experience ON job_seeker_profiles(experience_level);

-- ============================================================================
-- JOB SEEKER EDUCATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_seeker_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_profile_id UUID NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    
    -- Education Details
    degree VARCHAR(200) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    field VARCHAR(200),
    graduation_year INTEGER,
    gpa DECIMAL(3, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_year CHECK (graduation_year >= 1950 AND graduation_year <= 2100),
    CONSTRAINT valid_gpa CHECK (gpa >= 0.0 AND gpa <= 4.0)
);

CREATE INDEX IF NOT EXISTS idx_education_profile ON job_seeker_education(job_seeker_profile_id);
CREATE INDEX IF NOT EXISTS idx_education_year ON job_seeker_education(graduation_year);

-- ============================================================================
-- JOB SEEKER PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_seeker_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_profile_id UUID UNIQUE NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    
    -- Job Preferences
    job_types TEXT[],
    industries TEXT[],
    
    -- Salary Expectations
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Work Preferences
    remote_work BOOLEAN DEFAULT false,
    willing_to_relocate BOOLEAN DEFAULT false,
    working_hours VARCHAR(20) CHECK (working_hours IN ('full_time', 'part_time', 'flexible', 'contract')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

CREATE INDEX IF NOT EXISTS idx_preferences_profile ON job_seeker_preferences(job_seeker_profile_id);
CREATE INDEX IF NOT EXISTS idx_preferences_job_types ON job_seeker_preferences USING GIN(job_types);
CREATE INDEX IF NOT EXISTS idx_preferences_industries ON job_seeker_preferences USING GIN(industries);

-- ============================================================================
-- EMPLOYER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Company Information
    company_name VARCHAR(200) NOT NULL,
    company_size VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    logo_url TEXT,
    
    -- Verification
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Recruiter Information
    recruiter_name VARCHAR(200),
    recruiter_title VARCHAR(200),
    
    -- Company Culture
    benefits TEXT[],
    company_values TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_user_id ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_verification ON employer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_employer_company_name ON employer_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_employer_industry ON employer_profiles(industry);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_profiles_updated_at 
    BEFORE UPDATE ON job_seeker_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_preferences_updated_at 
    BEFORE UPDATE ON job_seeker_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at 
    BEFORE UPDATE ON employer_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    user_type_var VARCHAR;
    completion_score INTEGER := 0;
    total_fields INTEGER := 0;
BEGIN
    -- Get user type
    SELECT user_type INTO user_type_var FROM users WHERE id = user_id_param;
    
    IF user_type_var IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Base fields (all users)
    total_fields := 10;
    
    SELECT 
        (CASE WHEN first_name IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN last_name IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN profile_picture_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN phone IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN location_city IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN location_state IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN location_country IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN email_verified = true THEN 1 ELSE 0 END) +
        (CASE WHEN location_lat IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN location_lng IS NOT NULL THEN 1 ELSE 0 END)
    INTO completion_score
    FROM users
    WHERE id = user_id_param;
    
    -- Return percentage
    RETURN (completion_score * 100) / total_fields;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for complete user profiles (job seekers)
CREATE OR REPLACE VIEW v_job_seeker_complete_profiles AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.profile_picture_url,
    u.phone,
    u.location_city,
    u.location_state,
    u.location_country,
    u.location_lat,
    u.location_lng,
    u.created_at,
    u.updated_at,
    u.last_login_at,
    u.is_active,
    u.email_verified,
    u.onboarding_completed,
    u.privacy_settings,
    u.notification_settings,
    jsp.title,
    jsp.bio,
    jsp.resume_url,
    jsp.skills,
    jsp.experience_level,
    jsp.experience_years,
    jsp.portfolio,
    calculate_profile_completion(u.id) as profile_completion_percentage
FROM users u
LEFT JOIN job_seeker_profiles jsp ON u.id = jsp.user_id
WHERE u.user_type = 'job_seeker';

-- View for complete user profiles (employers)
CREATE OR REPLACE VIEW v_employer_complete_profiles AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.profile_picture_url,
    u.phone,
    u.location_city,
    u.location_state,
    u.location_country,
    u.created_at,
    u.updated_at,
    u.last_login_at,
    u.is_active,
    u.email_verified,
    u.onboarding_completed,
    u.privacy_settings,
    u.notification_settings,
    ep.company_name,
    ep.company_size,
    ep.industry,
    ep.website,
    ep.description,
    ep.logo_url,
    ep.verification_status,
    ep.verified_at,
    ep.recruiter_name,
    ep.recruiter_title,
    ep.benefits,
    ep.company_values,
    calculate_profile_completion(u.id) as profile_completion_percentage
FROM users u
LEFT JOIN employer_profiles ep ON u.id = ep.user_id
WHERE u.user_type = 'employer';

-- ============================================================================
-- SEED DATA (for development/testing)
-- ============================================================================

-- Note: In production, this section should be removed or commented out
-- This is just for initial testing

-- Insert a test user (job seeker)
-- INSERT INTO users (id, email, user_type, first_name, last_name, location_city, location_state, location_country, email_verified)
-- VALUES ('test-user-1', 'test.jobseeker@jobinder.com', 'job_seeker', 'Test', 'JobSeeker', 'San Francisco', 'California', 'United States', true);

-- Insert a test employer
-- INSERT INTO users (id, email, user_type, first_name, last_name, location_city, location_state, location_country, email_verified)
-- VALUES ('test-user-2', 'test.employer@jobinder.com', 'employer', 'Test', 'Employer', 'New York', 'New York', 'United States', true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 completed successfully';
    RAISE NOTICE 'Created tables: users, job_seeker_profiles, job_seeker_education, job_seeker_preferences, employer_profiles';
    RAISE NOTICE 'Created views: v_job_seeker_complete_profiles, v_employer_complete_profiles';
    RAISE NOTICE 'Created function: calculate_profile_completion';
END $$;

