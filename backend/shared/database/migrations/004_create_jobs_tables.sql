-- ============================================================================
-- Migration 004: Create Jobs and Matching Tables
-- Description: Tables for job postings, candidate matching, and applications
-- Created: 2025-10-19
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Job Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  
  -- Job Specifications
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  industry TEXT NOT NULL,
  department TEXT,
  
  -- Location
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_country TEXT NOT NULL,
  location_coordinates POINT,
  is_remote BOOLEAN DEFAULT false,
  hybrid_options TEXT,
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  show_salary BOOLEAN DEFAULT false,
  equity_offered BOOLEAN DEFAULT false,
  equity_details TEXT,
  
  -- Required Skills
  required_skills TEXT[] DEFAULT '{}',
  nice_to_have_skills TEXT[] DEFAULT '{}',
  
  -- Benefits & Perks
  benefits TEXT[] DEFAULT '{}',
  perks TEXT[] DEFAULT '{}',
  
  -- Application Details
  application_deadline TIMESTAMP WITH TIME ZONE,
  number_of_positions INTEGER DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled')),
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  matches_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  filled_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- Indexes for jobs table
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX idx_jobs_location_city ON jobs(location_city);
CREATE INDEX idx_jobs_location_country ON jobs(location_country);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_experience ON jobs(experience_level);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_remote ON jobs(is_remote) WHERE is_remote = true;
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC) WHERE published_at IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_jobs_search ON jobs USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(requirements, ''))
);

-- Auto-update trigger for jobs
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update published_at on first publish
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status = 'draft' AND NEW.published_at IS NULL THEN
    NEW.published_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_job_published_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- ============================================================================
-- JOB MATCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Match Details
  match_score DECIMAL(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- match_breakdown format: 
  -- {
  --   "skills": 85,
  --   "experience": 70,
  --   "location": 95,
  --   "industry": 60,
  --   "salary": 80,
  --   "matched_skills": ["React", "TypeScript"],
  --   "missing_skills": ["AWS"]
  -- }
  
  -- Employer Actions
  employer_status TEXT DEFAULT 'pending' CHECK (employer_status IN (
    'pending',      -- Not reviewed yet
    'interested',   -- Employer interested
    'rejected',     -- Employer not interested
    'contacted',    -- Employer reached out
    'interviewed',  -- Interview scheduled/completed
    'offered',      -- Job offer made
    'hired'         -- Candidate hired
  )),
  employer_swiped BOOLEAN DEFAULT false,
  employer_swiped_right BOOLEAN,
  employer_swiped_at TIMESTAMP WITH TIME ZONE,
  employer_viewed BOOLEAN DEFAULT false,
  employer_viewed_at TIMESTAMP WITH TIME ZONE,
  employer_notes TEXT,
  
  -- Job Seeker Actions
  job_seeker_status TEXT DEFAULT 'pending' CHECK (job_seeker_status IN (
    'pending',        -- Not reviewed yet
    'interested',     -- Job seeker interested
    'not_interested', -- Job seeker not interested
    'applied',        -- Formal application submitted
    'withdrawn'       -- Application withdrawn
  )),
  job_seeker_swiped BOOLEAN DEFAULT false,
  job_seeker_swiped_right BOOLEAN,
  job_seeker_swiped_at TIMESTAMP WITH TIME ZONE,
  job_seeker_viewed BOOLEAN DEFAULT false,
  job_seeker_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Mutual Match
  is_mutual_match BOOLEAN DEFAULT false,
  matched_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique matches
  UNIQUE(job_id, job_seeker_id)
);

-- Indexes for job_matches table
CREATE INDEX idx_matches_job ON job_matches(job_id);
CREATE INDEX idx_matches_seeker ON job_matches(job_seeker_id);
CREATE INDEX idx_matches_score ON job_matches(match_score DESC);
CREATE INDEX idx_matches_employer_status ON job_matches(employer_status);
CREATE INDEX idx_matches_seeker_status ON job_matches(job_seeker_status);
CREATE INDEX idx_matches_mutual ON job_matches(is_mutual_match) WHERE is_mutual_match = true;
CREATE INDEX idx_matches_created ON job_matches(created_at DESC);
CREATE INDEX idx_matches_pending_employer ON job_matches(job_id, employer_status) WHERE employer_status = 'pending';

-- Auto-update trigger for job_matches
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to detect and set mutual matches
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if both parties swiped right
  IF NEW.employer_swiped_right = true AND NEW.job_seeker_swiped_right = true THEN
    NEW.is_mutual_match = true;
    
    -- Set matched_at timestamp only once
    IF OLD.is_mutual_match = false OR OLD.is_mutual_match IS NULL THEN
      NEW.matched_at = CURRENT_TIMESTAMP;
    END IF;
  ELSE
    NEW.is_mutual_match = false;
    NEW.matched_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_mutual_match
  BEFORE INSERT OR UPDATE ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_match();

-- Trigger to increment job matches count
CREATE OR REPLACE FUNCTION increment_job_matches()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs 
  SET matches_count = matches_count + 1 
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_job_match_count
  AFTER INSERT ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_matches();

-- ============================================================================
-- JOB APPLICATIONS TABLE (Optional - for formal applications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES job_matches(id) ON DELETE SET NULL,
  
  -- Application Details
  cover_letter TEXT,
  custom_resume_url TEXT, -- If different from profile resume
  answers JSONB, -- Custom screening questions
  
  -- Status Tracking
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted',    -- Initial application
    'reviewed',     -- Employer reviewed
    'shortlisted',  -- Candidate shortlisted
    'interview',    -- Interview stage
    'rejected',     -- Application rejected
    'offer',        -- Job offer made
    'accepted',     -- Offer accepted
    'declined'      -- Offer declined
  )),
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Feedback
  rejection_reason TEXT,
  employer_feedback TEXT,
  
  UNIQUE(job_id, job_seeker_id)
);

-- Indexes for job_applications
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_seeker ON job_applications(job_seeker_id);
CREATE INDEX idx_applications_match ON job_applications(match_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_submitted ON job_applications(submitted_at DESC);

-- Trigger to increment job applications count
CREATE OR REPLACE FUNCTION increment_job_applications()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs 
  SET applications_count = applications_count + 1 
  WHERE id = NEW.job_id;
  
  -- Update match status to 'applied'
  IF NEW.match_id IS NOT NULL THEN
    UPDATE job_matches 
    SET job_seeker_status = 'applied' 
    WHERE id = NEW.match_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_job_application_count
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_applications();

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Active jobs with employer details
CREATE OR REPLACE VIEW active_jobs_view AS
SELECT 
  j.*,
  u.first_name || ' ' || u.last_name as employer_name,
  e.company_name,
  e.logo_url as company_logo,
  e.company_size,
  e.website as company_website
FROM jobs j
JOIN users u ON j.employer_id = u.id
LEFT JOIN employer_profiles e ON u.id = e.user_id
WHERE j.is_active = true AND j.status = 'active';

-- View: Job matches with candidate details
CREATE OR REPLACE VIEW job_matches_with_candidates AS
SELECT 
  jm.*,
  j.title as job_title,
  j.location_city as job_city,
  u.first_name,
  u.last_name,
  u.profile_picture_url,
  u.email,
  u.phone,
  u.location_city,
  u.location_country,
  js.title as candidate_title,
  js.bio,
  js.skills,
  js.experience_level,
  js.experience_years,
  js.resume_url
FROM job_matches jm
JOIN jobs j ON jm.job_id = j.id
JOIN users u ON jm.job_seeker_id = u.id
LEFT JOIN job_seeker_profiles js ON u.id = js.user_id;

-- View: Employer dashboard statistics
CREATE OR REPLACE VIEW employer_dashboard_stats AS
SELECT 
  u.id as employer_id,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'active' THEN j.id END) as active_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'draft' THEN j.id END) as draft_jobs,
  SUM(j.matches_count) as total_matches,
  SUM(j.applications_count) as total_applications,
  SUM(j.views_count) as total_views,
  COUNT(DISTINCT CASE WHEN jm.is_mutual_match = true THEN jm.id END) as mutual_matches,
  COUNT(DISTINCT CASE WHEN jm.employer_status = 'pending' THEN jm.id END) as pending_reviews
FROM users u
LEFT JOIN jobs j ON u.id = j.employer_id
LEFT JOIN job_matches jm ON j.id = jm.job_id
WHERE u.user_type = 'employer'
GROUP BY u.id;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get top candidates for a job
CREATE OR REPLACE FUNCTION get_top_candidates(
  p_job_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_min_score DECIMAL DEFAULT 50.0
)
RETURNS TABLE (
  match_id UUID,
  candidate_id TEXT,
  candidate_name TEXT,
  match_score DECIMAL,
  skills TEXT[],
  experience_level TEXT,
  location_city TEXT,
  profile_picture_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jm.id,
    jm.job_seeker_id,
    u.first_name || ' ' || u.last_name,
    jm.match_score,
    js.skills,
    js.experience_level,
    u.location_city,
    u.profile_picture_url
  FROM job_matches jm
  JOIN users u ON jm.job_seeker_id = u.id
  LEFT JOIN job_seeker_profiles js ON u.id = js.user_id
  WHERE jm.job_id = p_job_id
    AND jm.match_score >= p_min_score
    AND jm.employer_status NOT IN ('rejected', 'hired')
  ORDER BY jm.match_score DESC, jm.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get mutual matches for employer
CREATE OR REPLACE FUNCTION get_employer_mutual_matches(p_employer_id TEXT)
RETURNS TABLE (
  match_id UUID,
  job_id UUID,
  job_title TEXT,
  candidate_id TEXT,
  candidate_name TEXT,
  match_score DECIMAL,
  matched_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jm.id,
    jm.job_id,
    j.title,
    jm.job_seeker_id,
    u.first_name || ' ' || u.last_name,
    jm.match_score,
    jm.matched_at
  FROM job_matches jm
  JOIN jobs j ON jm.job_id = j.id
  JOIN users u ON jm.job_seeker_id = u.id
  WHERE j.employer_id = p_employer_id
    AND jm.is_mutual_match = true
  ORDER BY jm.matched_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate job completion percentage
CREATE OR REPLACE FUNCTION calculate_job_completion(p_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_job jobs;
  v_completed INTEGER := 0;
  v_total INTEGER := 10; -- Total required fields
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Count completed fields
  IF v_job.title IS NOT NULL AND length(v_job.title) > 0 THEN v_completed := v_completed + 1; END IF;
  IF v_job.description IS NOT NULL AND length(v_job.description) >= 50 THEN v_completed := v_completed + 1; END IF;
  IF v_job.requirements IS NOT NULL AND length(v_job.requirements) > 0 THEN v_completed := v_completed + 1; END IF;
  IF v_job.job_type IS NOT NULL THEN v_completed := v_completed + 1; END IF;
  IF v_job.experience_level IS NOT NULL THEN v_completed := v_completed + 1; END IF;
  IF v_job.industry IS NOT NULL THEN v_completed := v_completed + 1; END IF;
  IF v_job.location_city IS NOT NULL THEN v_completed := v_completed + 1; END IF;
  IF array_length(v_job.required_skills, 1) > 0 THEN v_completed := v_completed + 1; END IF;
  IF v_job.salary_min IS NOT NULL OR v_job.is_remote = true THEN v_completed := v_completed + 1; END IF;
  IF array_length(v_job.benefits, 1) > 0 THEN v_completed := v_completed + 1; END IF;
  
  RETURN (v_completed * 100) / v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample jobs for testing (only if employers exist)
DO $$
DECLARE
  v_employer_id TEXT;
  v_job_id UUID;
BEGIN
  -- Get first employer
  SELECT id INTO v_employer_id FROM users WHERE user_type = 'employer' LIMIT 1;
  
  IF v_employer_id IS NOT NULL THEN
    -- Sample Job 1: Senior React Developer
    INSERT INTO jobs (
      employer_id,
      title,
      description,
      requirements,
      responsibilities,
      job_type,
      experience_level,
      industry,
      location_city,
      location_state,
      location_country,
      is_remote,
      salary_min,
      salary_max,
      salary_currency,
      show_salary,
      required_skills,
      nice_to_have_skills,
      benefits,
      status,
      is_active
    ) VALUES (
      v_employer_id,
      'Senior React Developer',
      'We are looking for an experienced React developer to join our growing team. You will work on building scalable web applications using modern technologies.',
      E'- 5+ years of React experience\n- Strong TypeScript skills\n- Experience with state management (Redux, MobX, or similar)\n- RESTful API integration\n- Git version control',
      E'- Build and maintain React applications\n- Write clean, maintainable code\n- Collaborate with designers and backend developers\n- Code reviews and mentoring\n- Participate in architecture decisions',
      'full_time',
      'senior',
      'Technology',
      'Tel Aviv',
      'Tel Aviv',
      'Israel',
      true,
      20000,
      35000,
      'ILS',
      true,
      ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'],
      ARRAY['Node.js', 'GraphQL', 'AWS', 'Docker'],
      ARRAY['Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work'],
      'active',
      true
    ) RETURNING id INTO v_job_id;
    
    -- Update published_at for the job
    UPDATE jobs SET published_at = CURRENT_TIMESTAMP WHERE id = v_job_id;
    
    -- Sample Job 2: Backend Engineer
    INSERT INTO jobs (
      employer_id,
      title,
      description,
      requirements,
      job_type,
      experience_level,
      industry,
      location_city,
      location_state,
      location_country,
      is_remote,
      required_skills,
      benefits,
      status
    ) VALUES (
      v_employer_id,
      'Backend Engineer (Node.js)',
      'Join our backend team to build scalable APIs and microservices.',
      E'- 3+ years Node.js experience\n- PostgreSQL or similar RDBMS\n- RESTful API design\n- Docker and Kubernetes',
      'full_time',
      'mid',
      'Technology',
      'Tel Aviv',
      'Tel Aviv',
      'Israel',
      false,
      ARRAY['Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
      ARRAY['Health Insurance', 'Gym Membership', 'Learning Budget'],
      'active'
    );
    
    RAISE NOTICE 'Sample jobs created for employer: %', v_employer_id;
  ELSE
    RAISE NOTICE 'No employers found - skipping sample jobs';
  END IF;
END $$;

-- ============================================================================
-- ANALYTICS QUERIES (Examples)
-- ============================================================================

-- Get job performance summary
COMMENT ON TABLE jobs IS 'Job postings created by employers';
COMMENT ON TABLE job_matches IS 'Matching between jobs and job seekers with scores';
COMMENT ON TABLE job_applications IS 'Formal job applications from candidates';

-- Example: Get jobs with match statistics
-- SELECT 
--   j.id,
--   j.title,
--   j.status,
--   j.matches_count,
--   COUNT(jm.id) as actual_matches,
--   AVG(jm.match_score) as avg_match_score,
--   COUNT(CASE WHEN jm.is_mutual_match THEN 1 END) as mutual_matches
-- FROM jobs j
-- LEFT JOIN job_matches jm ON j.id = jm.job_id
-- WHERE j.employer_id = 'YOUR_EMPLOYER_ID'
-- GROUP BY j.id
-- ORDER BY j.created_at DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 004 completed successfully';
  RAISE NOTICE '   - jobs table created';
  RAISE NOTICE '   - job_matches table created';
  RAISE NOTICE '   - job_applications table created';
  RAISE NOTICE '   - Indexes and triggers created';
  RAISE NOTICE '   - Helper functions created';
  RAISE NOTICE '   - Views created';
END $$;

