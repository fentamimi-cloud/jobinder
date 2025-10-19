# Testing Guide - User Service

## Available Test Commands

### Run All Repository Tests
```bash
npm run test:repo
```
**What it does:** Runs all 4 test suites sequentially with a nice summary at the end
- Database Connection Test (4 tests)
- UserRepository Test (10 tests)
- JobSeekerRepository Test (9 tests)
- EmployerRepository Test (12 tests)

**Total:** 35 tests

---

### Run Individual Test Suites

#### 1. Database Connection Test
```bash
npm run test:db
```
Tests basic database connectivity, table verification, and CRUD operations.

#### 2. UserRepository Test
```bash
npm run test:user
```
Tests user CRUD operations, email validation, pagination, and more.

#### 3. JobSeekerRepository Test
```bash
npm run test:jobseeker
```
Tests job seeker profile creation, education management, and preferences.

#### 4. EmployerRepository Test
```bash
npm run test:employer
```
Tests employer profiles, verification system, search, and filtering.

---

## Test Output

Each test suite provides:
- ✅ Green checkmarks for passing tests
- Detailed logs of operations
- Duration of each test
- Summary at the end

### Example Output:
```
======================================================================
🧪 RUNNING ALL REPOSITORY TESTS
======================================================================

──────────────────────────────────────────────────────────────────────
📋 Test 1/4: Database Connection
──────────────────────────────────────────────────────────────────────

[INFO] Test 1: Testing basic connection...
[INFO] ✅ Basic connection test passed
...

✅ Database Connection PASSED (6593ms)

======================================================================
📊 TEST SUMMARY
======================================================================

1. ✅ PASS - Database Connection            (6593ms)
2. ✅ PASS - UserRepository                 (6256ms)
3. ✅ PASS - JobSeekerRepository            (8740ms)
4. ✅ PASS - EmployerRepository             (6373ms)

──────────────────────────────────────────────────────────────────────
Total Tests: 4
Passed: 4 ✅
Failed: 0 
Total Duration: 27966ms
──────────────────────────────────────────────────────────────────────

🎉 ALL TESTS PASSED! 🎉
```

---

## Prerequisites

Before running tests:

1. **PostgreSQL must be running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Environment variables must be set:**
   - Check `.env` file exists in user-service directory
   - `DATABASE_URL` should be configured

3. **Database tables must be created:**
   - Run migration: `backend/shared/database/migrations/001_create_user_tables.sql`

---

## Troubleshooting

### Tests Fail with Connection Error
**Problem:** Cannot connect to database

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep jobinder-postgres

# If not running, start it
cd /path/to/jobinder
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Tests Fail with "Table does not exist"
**Problem:** Database tables haven't been created

**Solution:**
```bash
# Run the migration
docker exec -i jobinder-postgres psql -U jobinder -d jobinder_dev < backend/shared/database/migrations/001_create_user_tables.sql

# Verify tables exist
docker exec jobinder-postgres psql -U jobinder -d jobinder_dev -c "\dt"
```

### TypeScript Compilation Errors
**Problem:** TypeScript cannot compile test files

**Solution:**
```bash
# Reinstall dependencies
npm install

# Check TypeScript configuration
npx tsc --noEmit
```

---

## Test Coverage

### Current Coverage
| Repository | Methods Tested | Tests | Coverage |
|-----------|----------------|-------|----------|
| Database | Connection, Tables, CRUD | 4 | 100% |
| UserRepository | 10 methods | 10 | 100% |
| JobSeekerRepository | 9 methods | 9 | 100% |
| EmployerRepository | 10 methods | 12 | 100% |
| **Total** | **29 methods** | **35 tests** | **100%** |

### What's Tested
- ✅ Database connectivity
- ✅ Table creation and structure
- ✅ User CRUD operations
- ✅ Email validation and uniqueness
- ✅ Job seeker profile management
- ✅ Education records management
- ✅ Preferences management
- ✅ Employer profile management
- ✅ Company verification system
- ✅ Search and filtering
- ✅ Pagination
- ✅ Transaction support
- ✅ Cascade deletion
- ✅ Error handling

---

## Future Testing

### Planned Test Suites
- [ ] Unit tests with Jest (mocked dependencies)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for complete flows
- [ ] Load testing
- [ ] Security testing

---

## Sample Data / Seeding

### Seed Sample Users

Create 5 job seekers and 2 employers with realistic data:

```bash
npm run seed
```

**What it creates:**
- **5 Job Seekers:**
  - Alice Johnson - Senior Full-Stack Developer (8 years exp, SF)
  - Michael Chen - UX/UI Designer (5 years exp, NYC)
  - Sarah Williams - Data Scientist (6 years exp, Austin)
  - David Martinez - DevOps Engineer (4 years exp, Seattle)
  - Emily Brown - Junior Frontend Developer (1 year exp, Boston)

- **2 Employers:**
  - TechCorp Solutions - Enterprise software (500-1000 employees, SF)
  - InnovatStartup Inc. - Fintech startup (10-50 employees, Austin)

Each includes:
- Complete profiles with skills, experience, bio
- Education records
- Job preferences (for seekers)
- Company details and benefits (for employers)

### Clean Sample Data

Remove all sample users from the database:

```bash
npm run seed:clean
```

This safely deletes all 7 sample users and their related data (profiles, education, preferences).

---

## Quick Reference

```bash
# Testing
npm run test:repo        # Run all repository tests
npm run test:user        # Test UserRepository
npm run test:jobseeker   # Test JobSeekerRepository
npm run test:employer    # Test EmployerRepository
npm run test:db          # Test database connection

# Seeding
npm run seed             # Create sample users
npm run seed:clean       # Remove sample users

# Jest (when implemented)
npm test
npm run test:watch
npm run test:coverage

# Development
npm run dev              # Start dev server
npm run build            # Build TypeScript
npm start                # Run production build
```

---

**Last Updated:** October 19, 2025  
**Status:** All tests passing ✅

