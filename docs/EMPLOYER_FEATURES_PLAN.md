# Employer Features Implementation Plan

## 📋 **Overview**

Complete implementation plan for employer-specific features:
1. **Job Management** - Create, view, edit, delete job postings
2. **Candidate List** - View matched candidates for each job
3. **Profile View** - Detailed candidate profiles with match scores

---

## 🎯 **Features Breakdown**

### **Feature 1: Job Management (CRUD)**
- ✅ Create new job postings
- ✅ View all employer's jobs
- ✅ Edit existing jobs
- ✅ Delete/archive jobs
- ✅ Job status management (draft, active, paused, closed)
- ✅ Job analytics (views, applications, matches)

### **Feature 2: Candidate Matching**
- ✅ AI-powered candidate matching for each job
- ✅ Match score calculation (skills, experience, location)
- ✅ Candidate ranking by relevance
- ✅ Filter and sort candidates
- ✅ Swipe-style candidate review

### **Feature 3: Candidate Profiles**
- ✅ View candidate details
- ✅ See match breakdown (why they match)
- ✅ View resume
- ✅ Contact candidate
- ✅ Mark as favorite/interested

---

## 🗄️ **Database Schema**

### **New Tables to Create**

#### **1. jobs**
```sql
CREATE TABLE jobs (
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
  
  -- Required Skills
  required_skills TEXT[] DEFAULT '{}',
  nice_to_have_skills TEXT[] DEFAULT '{}',
  
  -- Benefits & Perks
  benefits TEXT[] DEFAULT '{}',
  perks TEXT[] DEFAULT '{}',
  
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
  filled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_location ON jobs(location_city, location_country);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_experience ON jobs(experience_level);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Auto-update trigger
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### **2. job_matches**
```sql
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Match Details
  match_score DECIMAL(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_breakdown JSONB NOT NULL, -- { skills: 85, experience: 70, location: 95, ... }
  
  -- Status
  employer_status TEXT DEFAULT 'pending' CHECK (employer_status IN ('pending', 'interested', 'rejected', 'contacted', 'interviewed', 'offered', 'hired')),
  job_seeker_status TEXT DEFAULT 'pending' CHECK (job_seeker_status IN ('pending', 'interested', 'not_interested', 'applied', 'withdrawn')),
  
  -- Swipe Actions
  employer_swiped BOOLEAN DEFAULT false,
  employer_swiped_right BOOLEAN,
  employer_swiped_at TIMESTAMP WITH TIME ZONE,
  
  job_seeker_swiped BOOLEAN DEFAULT false,
  job_seeker_swiped_right BOOLEAN,
  job_seeker_swiped_at TIMESTAMP WITH TIME ZONE,
  
  -- Mutual Match
  is_mutual_match BOOLEAN DEFAULT false,
  matched_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  employer_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(job_id, job_seeker_id)
);

-- Indexes
CREATE INDEX idx_matches_job ON job_matches(job_id);
CREATE INDEX idx_matches_seeker ON job_matches(job_seeker_id);
CREATE INDEX idx_matches_score ON job_matches(match_score DESC);
CREATE INDEX idx_matches_employer_status ON job_matches(employer_status);
CREATE INDEX idx_matches_mutual ON job_matches(is_mutual_match) WHERE is_mutual_match = true;
CREATE INDEX idx_matches_created ON job_matches(created_at DESC);

-- Auto-update trigger
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set mutual match
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employer_swiped_right = true AND NEW.job_seeker_swiped_right = true THEN
    NEW.is_mutual_match = true;
    NEW.matched_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_mutual_match
  BEFORE UPDATE ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_match();
```

#### **3. job_applications** (Optional - for formal applications)
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application Details
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'interview', 'rejected', 'offer', 'accepted', 'declined')),
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status_updated_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(job_id, job_seeker_id)
);

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_seeker ON job_applications(job_seeker_id);
CREATE INDEX idx_applications_status ON job_applications(status);
```

---

## 🏗️ **Backend Implementation**

### **Phase 1: Job Service (Week 4)**

#### **Files to Create:**

**1. Job Repository** (`backend/services/user-service/src/repositories/JobRepository.ts`)
```typescript
export class JobRepository {
  // CRUD Operations
  async create(employerId: string, jobData: CreateJobData): Promise<Job>
  async findById(jobId: string): Promise<Job | null>
  async findByEmployer(employerId: string, filters?: JobFilters): Promise<Job[]>
  async update(jobId: string, jobData: UpdateJobData): Promise<Job>
  async delete(jobId: string): Promise<void>
  async archive(jobId: string): Promise<void>
  
  // Status Management
  async updateStatus(jobId: string, status: JobStatus): Promise<Job>
  async publish(jobId: string): Promise<Job>
  async pause(jobId: string): Promise<Job>
  
  // Analytics
  async incrementViews(jobId: string): Promise<void>
  async getJobStats(jobId: string): Promise<JobStats>
  
  // Search & Filter
  async search(query: string, filters: JobFilters): Promise<Job[]>
  async findActiveJobs(filters?: JobFilters): Promise<Job[]>
}
```

**2. Match Repository** (`backend/services/user-service/src/repositories/MatchRepository.ts`)
```typescript
export class MatchRepository {
  // Match Management
  async create(jobId: string, jobSeekerId: string, matchScore: number, breakdown: any): Promise<Match>
  async findByJob(jobId: string, filters?: MatchFilters): Promise<Match[]>
  async findByJobSeeker(jobSeekerId: string): Promise<Match[]>
  async findById(matchId: string): Promise<Match | null>
  
  // Swipe Actions
  async employerSwipe(matchId: string, swipeRight: boolean): Promise<Match>
  async jobSeekerSwipe(matchId: string, swipeRight: boolean): Promise<Match>
  
  // Status Updates
  async updateEmployerStatus(matchId: string, status: EmployerMatchStatus): Promise<Match>
  async updateJobSeekerStatus(matchId: string, status: JobSeekerMatchStatus): Promise<Match>
  
  // Mutual Matches
  async getMutualMatches(employerId: string): Promise<Match[]>
  
  // Notes
  async addEmployerNotes(matchId: string, notes: string): Promise<void>
}
```

**3. Job Service** (`backend/services/user-service/src/services/JobService.ts`)
```typescript
export class JobService {
  private jobRepository: JobRepository;
  private matchRepository: MatchRepository;
  
  // Job Management
  async createJob(employerId: string, jobData: CreateJobData): Promise<Job>
  async getJob(jobId: string): Promise<Job | null>
  async getEmployerJobs(employerId: string, filters?: JobFilters): Promise<Job[]>
  async updateJob(jobId: string, jobData: UpdateJobData): Promise<Job>
  async deleteJob(jobId: string): Promise<void>
  async publishJob(jobId: string): Promise<Job>
  
  // Validation
  private validateJobData(data: CreateJobData): void
  private checkEmployerOwnership(jobId: string, employerId: string): Promise<boolean>
}
```

**4. Matching Service** (`backend/services/user-service/src/services/MatchingService.ts`)
```typescript
export class MatchingService {
  // Core Matching Algorithm
  async generateMatchesForJob(jobId: string): Promise<Match[]>
  async calculateMatchScore(job: Job, jobSeeker: JobSeekerProfile): Promise<number>
  async getMatchBreakdown(job: Job, jobSeeker: JobSeekerProfile): Promise<MatchBreakdown>
  
  // Scoring Components
  private scoreSkills(jobSkills: string[], candidateSkills: string[]): number
  private scoreExperience(required: string, candidateLevel: string, years: number): number
  private scoreLocation(jobLocation: Location, candidateLocation: Location): number
  private scoreIndustry(jobIndustry: string, candidatePreferences: any): number
  
  // Match Management
  async getCandidatesForJob(jobId: string, filters?: CandidateFilters): Promise<Match[]>
  async swipeCandidate(matchId: string, swipeRight: boolean): Promise<Match>
}
```

**5. Job Controller** (`backend/services/user-service/src/controllers/JobController.ts`)
```typescript
export class JobController {
  // Job CRUD
  async createJob(req, res): Promise<void>       // POST /api/jobs
  async getJob(req, res): Promise<void>          // GET /api/jobs/:jobId
  async getMyJobs(req, res): Promise<void>       // GET /api/jobs
  async updateJob(req, res): Promise<void>       // PUT /api/jobs/:jobId
  async deleteJob(req, res): Promise<void>       // DELETE /api/jobs/:jobId
  
  // Job Management
  async publishJob(req, res): Promise<void>      // POST /api/jobs/:jobId/publish
  async pauseJob(req, res): Promise<void>        // POST /api/jobs/:jobId/pause
  async closeJob(req, res): Promise<void>        // POST /api/jobs/:jobId/close
  
  // Job Analytics
  async getJobStats(req, res): Promise<void>     // GET /api/jobs/:jobId/stats
  async getDashboardStats(req, res): Promise<void> // GET /api/jobs/stats/dashboard
}
```

**6. Match Controller** (`backend/services/user-service/src/controllers/MatchController.ts`)
```typescript
export class MatchController {
  // Candidate Browsing
  async getCandidatesForJob(req, res): Promise<void>  // GET /api/jobs/:jobId/candidates
  async getCandidateProfile(req, res): Promise<void>  // GET /api/jobs/:jobId/candidates/:candidateId
  
  // Swipe Actions
  async swipeCandidate(req, res): Promise<void>       // POST /api/jobs/:jobId/candidates/:candidateId/swipe
  
  // Match Management
  async updateCandidateStatus(req, res): Promise<void> // PUT /api/matches/:matchId/status
  async addCandidateNotes(req, res): Promise<void>     // POST /api/matches/:matchId/notes
  
  // Mutual Matches
  async getMutualMatches(req, res): Promise<void>      // GET /api/matches/mutual
}
```

**7. Validation Schemas** (`backend/services/user-service/src/validation/jobSchemas.ts`)
```typescript
export const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(50).max(5000).required(),
  requirements: Joi.string().max(2000).optional(),
  responsibilities: Joi.string().max(2000).optional(),
  jobType: Joi.string().valid('full_time', 'part_time', 'contract', 'internship', 'freelance').required(),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').required(),
  industry: Joi.string().required(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  isRemote: Joi.boolean().optional(),
  salaryMin: Joi.number().min(0).optional(),
  salaryMax: Joi.number().min(Joi.ref('salaryMin')).optional(),
  salaryCurrency: Joi.string().default('USD'),
  showSalary: Joi.boolean().default(false),
  requiredSkills: Joi.array().items(Joi.string()).min(1).required(),
  niceToHaveSkills: Joi.array().items(Joi.string()).optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
});

export const updateJobSchema = createJobSchema.fork(
  ['title', 'description', 'jobType', 'experienceLevel', 'industry', 'location', 'requiredSkills'],
  (schema) => schema.optional()
);
```

**8. Routes** (`backend/services/user-service/src/routes/jobs.ts`)
```typescript
const router = express.Router();
const jobController = new JobController();
const matchController = new MatchController();

// All routes require employer authentication
router.use(authenticateToken);
router.use(requireUserType(['employer']));

// Job CRUD
router.post('/', validateRequest(createJobSchema), jobController.createJob);
router.get('/', jobController.getMyJobs);
router.get('/stats/dashboard', jobController.getDashboardStats);
router.get('/:jobId', jobController.getJob);
router.put('/:jobId', validateRequest(updateJobSchema), jobController.updateJob);
router.delete('/:jobId', jobController.deleteJob);

// Job Management
router.post('/:jobId/publish', jobController.publishJob);
router.post('/:jobId/pause', jobController.pauseJob);
router.post('/:jobId/close', jobController.closeJob);
router.get('/:jobId/stats', jobController.getJobStats);

// Candidate Matching
router.get('/:jobId/candidates', matchController.getCandidatesForJob);
router.get('/:jobId/candidates/:candidateId', matchController.getCandidateProfile);
router.post('/:jobId/candidates/:candidateId/swipe', matchController.swipeCandidate);

export { router as jobRoutes };
```

---

## 🎨 **Frontend Implementation**

### **Phase 2: Employer Dashboard (Week 5)**

#### **New Pages:**

**1. Employer Dashboard** (`frontend/web/src/pages/EmployerDashboard.tsx`)
```typescript
// Overview page showing:
- Active jobs count
- Total candidates matched
- Recent matches
- Quick actions (Create Job, View Candidates)
- Job performance metrics
```

**2. Job List Page** (`frontend/web/src/pages/JobList.tsx`)
```typescript
// Table/card view of all employer's jobs
- List of all jobs with status badges
- Quick filters (Active, Draft, Closed)
- Search by title
- Sort by date, matches, views
- Action buttons (Edit, View Candidates, Pause/Activate, Delete)
```

**3. Job Form Page** (`frontend/web/src/pages/JobForm.tsx`)
```typescript
// Create/Edit job form
- Multi-step wizard or single form
- Job details (title, description, requirements)
- Location & remote options
- Salary range (optional, can hide)
- Required skills (searchable chips)
- Benefits & perks
- Preview before publish
- Save as draft or publish immediately
```

**4. Candidate List Page** (`frontend/web/src/pages/CandidateList.tsx`)
```typescript
// For a specific job
- Grid/list of matched candidates
- Match score badges
- Quick filters (Match score, Experience level, Location)
- Sort by match score, date
- Swipe cards or list view toggle
- Quick actions (View Profile, Interested, Not Interested)
```

**5. Candidate Profile Page** (`frontend/web/src/pages/CandidateProfile.tsx`)
```typescript
// Detailed candidate view
- Profile picture
- Name, title, location
- Match score with breakdown
- Skills (matched vs missing)
- Experience details
- Bio
- Resume download button
- Action buttons (Contact, Mark Interested, Reject)
- Notes section for employer
```

#### **New Components:**

**1. Job Card** (`frontend/web/src/components/JobCard.tsx`)
```typescript
// Reusable job display card
- Job title & company
- Location & remote badge
- Salary range (if shown)
- Match count badge
- Status badge (Active, Paused, etc.)
- Quick action menu
```

**2. Candidate Card** (`frontend/web/src/components/CandidateCard.tsx`)
```typescript
// Swipeable candidate card
- Profile picture
- Name & title
- Match score (circular progress)
- Top 3-5 matched skills
- Location
- Experience level
- Swipe actions (left/right)
```

**3. Match Score Component** (`frontend/web/src/components/MatchScore.tsx`)
```typescript
// Visual match score display
- Circular progress (0-100%)
- Color coding (red < 50, yellow 50-75, green > 75)
- Breakdown tooltip (skills: 85%, experience: 70%, etc.)
```

**4. Job Stats Widget** (`frontend/web/src/components/JobStatsWidget.tsx`)
```typescript
// Analytics widget
- Total views
- Applications
- Matches generated
- Response rate
- Charts (optional)
```

**5. Candidate Swiper** (`frontend/web/src/components/CandidateSwiper.tsx`)
```typescript
// Tinder-style swipe interface
- Swipeable cards
- Swipe left (not interested)
- Swipe right (interested)
- Animations
- Undo last swipe (optional)
```

#### **New Services:**

**1. Job Service** (`frontend/web/src/services/jobService.ts`)
```typescript
class JobService {
  async createJob(jobData: CreateJobData): Promise<ApiResponse<Job>>
  async getMyJobs(filters?: JobFilters): Promise<ApiResponse<Job[]>>
  async getJob(jobId: string): Promise<ApiResponse<Job>>
  async updateJob(jobId: string, jobData: UpdateJobData): Promise<ApiResponse<Job>>
  async deleteJob(jobId: string): Promise<ApiResponse>
  async publishJob(jobId: string): Promise<ApiResponse<Job>>
  async pauseJob(jobId: string): Promise<ApiResponse<Job>>
  async getJobStats(jobId: string): Promise<ApiResponse<JobStats>>
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>>
}
```

**2. Match Service** (`frontend/web/src/services/matchService.ts`)
```typescript
class MatchService {
  async getCandidates(jobId: string, filters?: CandidateFilters): Promise<ApiResponse<Match[]>>
  async getCandidateProfile(jobId: string, candidateId: string): Promise<ApiResponse<CandidateDetails>>
  async swipeCandidate(jobId: string, candidateId: string, swipeRight: boolean): Promise<ApiResponse<Match>>
  async updateCandidateStatus(matchId: string, status: string): Promise<ApiResponse<Match>>
  async addNotes(matchId: string, notes: string): Promise<ApiResponse>
  async getMutualMatches(): Promise<ApiResponse<Match[]>>
}
```

---

## 📅 **Implementation Timeline**

### **Week 4: Backend Job Management**
**Days 1-2: Database & Repositories**
- [ ] Create migration for jobs and job_matches tables
- [ ] Implement JobRepository
- [ ] Implement MatchRepository
- [ ] Test CRUD operations

**Days 3-4: Services & Controllers**
- [ ] Implement JobService
- [ ] Implement MatchingService (basic algorithm)
- [ ] Implement JobController
- [ ] Implement MatchController

**Day 5: Testing & Integration**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test with Postman/curl
- [ ] Document APIs

### **Week 5: Frontend Employer Dashboard**
**Days 1-2: Job Management UI**
- [ ] Create EmployerDashboard page
- [ ] Create JobList page
- [ ] Create JobForm page
- [ ] Implement job service
- [ ] Test job CRUD flow

**Days 3-4: Candidate Matching UI**
- [ ] Create CandidateList page
- [ ] Create CandidateProfile page
- [ ] Create CandidateSwiper component
- [ ] Implement match service
- [ ] Test candidate browsing

**Day 5: Polish & Integration**
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Responsive design
- [ ] E2E testing

### **Week 6: Matching Algorithm Enhancement**
**Days 1-3: Advanced Matching**
- [ ] Skill similarity algorithm (fuzzy matching)
- [ ] Location-based scoring with distance
- [ ] Experience level compatibility
- [ ] Industry preferences
- [ ] Salary expectations matching

**Days 4-5: Real-time Updates**
- [ ] WebSocket integration for new matches
- [ ] Real-time notifications
- [ ] Match queue management
- [ ] Auto-match generation on job publish

---

## 🎯 **Matching Algorithm (Basic)**

```typescript
function calculateMatchScore(job: Job, candidate: JobSeekerProfile): number {
  let totalScore = 0;
  let weights = {
    skills: 0.40,       // 40% - Most important
    experience: 0.25,   // 25% - Second most important
    location: 0.20,     // 20% - Location matters
    industry: 0.10,     // 10% - Industry preference
    salary: 0.05,       // 5% - Salary expectations
  };
  
  // 1. Skills Matching (40%)
  const matchedSkills = job.requiredSkills.filter(skill => 
    candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
  );
  const skillScore = (matchedSkills.length / job.requiredSkills.length) * 100;
  totalScore += skillScore * weights.skills;
  
  // 2. Experience Level (25%)
  const experienceLevels = { entry: 1, mid: 2, senior: 3, executive: 4 };
  const jobLevel = experienceLevels[job.experienceLevel];
  const candidateLevel = experienceLevels[candidate.experienceLevel];
  const experienceScore = candidateLevel >= jobLevel ? 100 : (candidateLevel / jobLevel) * 70;
  totalScore += experienceScore * weights.experience;
  
  // 3. Location (20%)
  const locationScore = job.isRemote ? 100 :
    (job.location.city === candidate.location.city) ? 100 :
    (job.location.country === candidate.location.country) ? 50 : 0;
  totalScore += locationScore * weights.location;
  
  // 4. Industry (10%)
  const industryScore = candidate.preferences.industries.includes(job.industry) ? 100 : 50;
  totalScore += industryScore * weights.industry;
  
  // 5. Salary (5%)
  const salaryScore = checkSalaryMatch(job.salaryMin, job.salaryMax, candidate.preferences.salaryRange);
  totalScore += salaryScore * weights.salary;
  
  return Math.round(totalScore);
}
```

---

## 🎨 **UI/UX Design**

### **Employer Dashboard Layout:**

```
┌─────────────────────────────────────────────────┐
│ Jobinder                           👤 Logout    │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Dashboard                                   │
│  ├─ 📝 My Jobs (5 active)                      │
│  ├─ 👥 Candidates (23 matched)                 │
│  ├─ ⭐ Favorites (7)                           │
│  └─ 💬 Messages (3 new)                        │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │ Active Jobs │ │  Candidates │ │  Matches │ │
│  │      5      │ │     23      │ │    12    │ │
│  └─────────────┘ └─────────────┘ └──────────┘ │
│                                                 │
│  Recent Matches:                                │
│  ┌─────────────────────────────────────────┐   │
│  │ Sarah Cohen  85%  Senior Developer      │   │
│  │ [View] [Contact] [Not Interested]       │   │
│  ├─────────────────────────────────────────┤   │
│  │ David Levi   78%  Full Stack Engineer   │   │
│  │ [View] [Contact] [Not Interested]       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [+ Create New Job]                             │
└─────────────────────────────────────────────────┘
```

### **Job List View:**

```
┌─────────────────────────────────────────────────┐
│ My Jobs                    [+ Create New Job]   │
├─────────────────────────────────────────────────┤
│ 🔍 Search jobs...    [All ▼] [Sort: Date ▼]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Senior React Developer         [Active] │   │
│ │ Tel Aviv • Full Time • 2 days ago      │   │
│ │ 👥 12 candidates • 👁 45 views         │   │
│ │ [View Candidates] [Edit] [Pause] [⋮]   │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Backend Developer              [Paused] │   │
│ │ Remote • Full Time • 5 days ago        │   │
│ │ 👥 8 candidates • 👁 23 views          │   │
│ │ [View Candidates] [Edit] [Activate][⋮] │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### **Candidate Swipe View:**

```
┌─────────────────────────────────────────────────┐
│ ← Back to Jobs     Senior React Developer       │
├─────────────────────────────────────────────────┤
│           Candidate 3 of 12                     │
│                                                 │
│        ┌───────────────────────┐               │
│        │      [Photo]          │               │
│        │   Sarah Cohen         │               │
│        │  Senior Developer     │               │
│        │   Tel Aviv, Israel    │               │
│        │                       │               │
│        │  Match Score: 85%     │               │
│        │  [■■■■■■■■□□]         │               │
│        │                       │               │
│        │  ✅ React (5 years)   │               │
│        │  ✅ TypeScript        │               │
│        │  ✅ Node.js           │               │
│        │  ⚠️  AWS (learning)   │               │
│        │                       │               │
│        │  📄 View Full Profile │               │
│        │                       │               │
│        │  [👎] [❤️] [📧]       │               │
│        │  Pass  Like Contact   │               │
│        └───────────────────────┘               │
│                                                 │
│  [← Previous]              [Next →]             │
└─────────────────────────────────────────────────┘
```

### **Candidate Profile Detail:**

```
┌─────────────────────────────────────────────────┐
│ ← Back to Candidates                            │
├─────────────────────────────────────────────────┤
│  ┌──────┐  Sarah Cohen                         │
│  │ 👤   │  Senior Full Stack Developer          │
│  └──────┘  Tel Aviv, Israel                     │
│                                                 │
│  Match Score: 85%                               │
│  ┌────────────────────────────────────┐        │
│  │ Skills Match:        90% ████████  │        │
│  │ Experience Match:    85% ████████  │        │
│  │ Location Match:      100% █████████│        │
│  │ Salary Match:        75% ███████   │        │
│  └────────────────────────────────────┘        │
│                                                 │
│  📧 sarah.cohen@example.com                     │
│  📱 +972-50-123-4567                            │
│                                                 │
│  About:                                         │
│  Experienced full-stack developer with 5+       │
│  years building scalable web applications...    │
│                                                 │
│  Skills:                                        │
│  ✅ React ✅ TypeScript ✅ Node.js              │
│  ✅ PostgreSQL ⚠️ AWS ✅ Docker                │
│                                                 │
│  Experience: 5 years                            │
│  Level: Senior                                  │
│                                                 │
│  [📄 Download Resume]                           │
│                                                 │
│  Notes (Private):                               │
│  ┌────────────────────────────────────┐        │
│  │ Great candidate, reach out ASAP... │        │
│  └────────────────────────────────────┘        │
│  [Save Notes]                                   │
│                                                 │
│  [❤️ Mark Interested] [📧 Contact] [👎 Pass]   │
└─────────────────────────────────────────────────┘
```

---

## 🔄 **User Flows**

### **Flow 1: Create Job & Find Candidates**

```
1. Employer logs in → Dashboard
2. Clicks "Create New Job"
3. Fills job form (multi-step wizard)
   - Step 1: Job basics (title, description, type)
   - Step 2: Requirements (skills, experience)
   - Step 3: Location & remote
   - Step 4: Salary & benefits
4. Preview job posting
5. Clicks "Publish Job"
6. Backend auto-generates matches (background job)
7. Employer sees "23 candidates matched!"
8. Clicks "View Candidates"
9. Swipe through candidates
10. Swipe right on interested candidates
11. When candidate also swiped right → Mutual Match! 🎉
12. Can now contact via messaging
```

### **Flow 2: Review Candidates for Existing Job**

```
1. Employer → Job List
2. Clicks job card → Candidate List
3. Sees list sorted by match score
4. Clicks candidate → Detailed profile view
5. Reviews skills, experience, resume
6. Adds private notes
7. Marks "Interested" or "Not Interested"
8. Returns to candidate list
9. Continues reviewing next candidate
```

### **Flow 3: Edit Job Posting**

```
1. Employer → Job List
2. Clicks "Edit" on job card
3. Job form opens pre-filled
4. Makes changes
5. Clicks "Update Job"
6. Backend re-calculates matches (if requirements changed)
7. Shows "3 new candidates matched!"
```

---

## 🎯 **API Endpoints Summary**

### **Jobs API:**
```
POST   /api/jobs                          - Create job
GET    /api/jobs                          - Get employer's jobs
GET    /api/jobs/:jobId                   - Get job details
PUT    /api/jobs/:jobId                   - Update job
DELETE /api/jobs/:jobId                   - Delete job
POST   /api/jobs/:jobId/publish           - Publish draft job
POST   /api/jobs/:jobId/pause             - Pause active job
POST   /api/jobs/:jobId/close             - Close job
GET    /api/jobs/:jobId/stats             - Job analytics
GET    /api/jobs/stats/dashboard          - Dashboard stats
```

### **Candidates API:**
```
GET    /api/jobs/:jobId/candidates                     - List candidates for job
GET    /api/jobs/:jobId/candidates/:candidateId        - Candidate profile
POST   /api/jobs/:jobId/candidates/:candidateId/swipe  - Swipe candidate
PUT    /api/matches/:matchId/status                    - Update match status
POST   /api/matches/:matchId/notes                     - Add employer notes
GET    /api/matches/mutual                             - Get mutual matches
```

---

## 🧪 **Testing Strategy**

### **Backend Tests:**
```typescript
// JobRepository.test.ts
✓ Create job
✓ Get job by ID
✓ Get employer jobs
✓ Update job
✓ Delete job
✓ Archive job

// MatchingService.test.ts
✓ Calculate match score
✓ Generate matches for job
✓ Skills matching algorithm
✓ Experience level scoring
✓ Location matching

// JobController.test.ts
✓ POST /api/jobs (create)
✓ GET /api/jobs (list)
✓ PUT /api/jobs/:id (update)
✓ DELETE /api/jobs/:id (delete)
✓ Authorization checks
```

### **Frontend Tests:**
```typescript
// JobForm.test.tsx
✓ Render form
✓ Validate required fields
✓ Submit job
✓ Edit existing job

// CandidateSwiper.test.tsx
✓ Swipe left
✓ Swipe right
✓ Navigate between candidates
✓ Mutual match notification
```

---

## 📊 **Success Metrics**

### **By End of Week 4:**
- [ ] Employer can create jobs via API
- [ ] Jobs stored in PostgreSQL
- [ ] Basic matching algorithm working
- [ ] Candidates ranked by match score
- [ ] API endpoints tested and documented

### **By End of Week 5:**
- [ ] Employer can create jobs via UI
- [ ] View all their jobs in a list
- [ ] Edit/pause/delete jobs
- [ ] Browse matched candidates
- [ ] Swipe through candidates
- [ ] View detailed candidate profiles

### **By End of Week 6:**
- [ ] Advanced matching with 80%+ accuracy
- [ ] Real-time match notifications
- [ ] Mutual match detection
- [ ] Analytics and insights
- [ ] Full E2E employer workflow working

---

## 🔐 **Security Considerations**

1. **Authorization:**
   - Only employers can access these endpoints
   - Employers can only manage their own jobs
   - Can only view candidates matched to their jobs

2. **Data Privacy:**
   - Candidate contact info only shown after mutual match
   - Resume access requires permission
   - Private notes only visible to employer

3. **Rate Limiting:**
   - Limit job creation (e.g., 10 per day)
   - Limit match generation to prevent abuse
   - Throttle candidate viewing

---

## 💡 **Nice-to-Have Features (Future)**

1. **Job Templates** - Save and reuse job postings
2. **Bulk Actions** - Pause/activate multiple jobs
3. **Candidate Search** - Search all candidates (premium)
4. **Interview Scheduling** - Built-in calendar integration
5. **Collaborative Hiring** - Multiple team members review candidates
6. **ATS Integration** - Export to Greenhouse, Lever, etc.
7. **Job Promotion** - Boost visibility (paid feature)
8. **Analytics Dashboard** - Detailed hiring metrics
9. **Email Templates** - Pre-written outreach messages
10. **Application Tracking** - Kanban board for hiring pipeline

---

## 📦 **Deliverables**

### **Week 4 Deliverables:**
- ✅ Database migration file
- ✅ JobRepository + MatchRepository
- ✅ JobService + MatchingService
- ✅ JobController + MatchController
- ✅ API routes configured
- ✅ Validation schemas
- ✅ Unit + integration tests
- ✅ API documentation

### **Week 5 Deliverables:**
- ✅ EmployerDashboard page
- ✅ JobList page
- ✅ JobForm page
- ✅ CandidateList page
- ✅ CandidateProfile page
- ✅ CandidateSwiper component
- ✅ jobService + matchService
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

### **Week 6 Deliverables:**
- ✅ Advanced matching algorithm
- ✅ Real-time notifications
- ✅ WebSocket integration
- ✅ Analytics dashboard
- ✅ E2E tests
- ✅ Performance optimization

---

## 🚀 **Getting Started**

### **Immediate Next Steps:**

**Step 1: Create Database Migration**
```bash
# Create migration file
touch backend/shared/database/migrations/004_create_jobs_tables.sql

# Write schema (jobs + job_matches tables)
# Run migration
docker exec jobinder-postgres psql -U jobinder -d jobinder_dev -f /path/to/migration
```

**Step 2: Implement Repositories**
```bash
# Create repository files
backend/services/user-service/src/repositories/
  ├── JobRepository.ts
  └── MatchRepository.ts
```

**Step 3: Implement Services**
```bash
# Create service files
backend/services/user-service/src/services/
  ├── JobService.ts
  └── MatchingService.ts
```

**Step 4: Create Controllers & Routes**
```bash
# Create controller and route files
backend/services/user-service/src/controllers/JobController.ts
backend/services/user-service/src/controllers/MatchController.ts
backend/services/user-service/src/routes/jobs.ts
```

---

## 🎯 **Dependencies Needed**

### **Backend:**
```bash
# No new dependencies needed! 
# Already have:
# - pg (PostgreSQL)
# - express
# - joi (validation)
```

### **Frontend:**
```bash
# Install swipeable cards
npm install react-swipeable

# Already have:
# - react-router-dom
# - axios
# - Material-UI
```

---

## 📈 **Complexity Estimate**

| Component | Complexity | Time Estimate |
|-----------|------------|---------------|
| Database Schema | Medium | 4 hours |
| JobRepository | Medium | 6 hours |
| MatchRepository | Medium | 6 hours |
| JobService | Medium | 8 hours |
| MatchingService | High | 12 hours |
| Controllers | Medium | 8 hours |
| API Routes | Low | 2 hours |
| Frontend Pages | High | 16 hours |
| Components | Medium | 12 hours |
| Services | Low | 4 hours |
| Testing | High | 12 hours |
| **TOTAL** | | **~90 hours (11-12 days)** |

---

## 🎉 **Ready to Begin!**

This plan provides a complete roadmap for building employer job management and candidate matching features.

**Recommended Approach:**
1. Start with backend (Week 4) - solid foundation
2. Build frontend UI (Week 5) - user-facing features
3. Enhance matching (Week 6) - optimization & polish

---

**Would you like me to start implementing this plan?**

Options:
- **A.** Start with database migration (jobs + job_matches tables)
- **B.** Start with JobRepository and MatchRepository
- **C.** Show me a more detailed breakdown of a specific component
- **D.** Modify the plan based on your priorities

Let me know and I'll start building! 🚀

---

**Plan Created:** October 19, 2025  
**Estimated Timeline:** 3 weeks (Weeks 4-6)  
**Status:** Ready for Implementation

