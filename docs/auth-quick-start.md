# 🚀 Authentication Quick Start Guide

## Immediate Action Items

### Prerequisites Checklist
- [ ] PostgreSQL running on `localhost:5432`
- [ ] Firebase project created
- [ ] Node.js 18+ installed
- [ ] Environment variables configured

---

## 🏃 Day 1: Database Setup (2-3 hours)

### Step 1: Create Database Migration
```bash
cd /Users/shmunika/Documents/software/ai-projects/jobinder/backend/shared/database
mkdir -p migrations
```

Create `migrations/001_create_users_table.sql`:
```sql
-- See full schema in auth-implementation-plan.md
-- This creates: users, job_seeker_profiles, employer_profiles, etc.
```

### Step 2: Run Migration
```bash
# Set your database URL
export DATABASE_URL="postgresql://jobinder:password@localhost:5432/jobinder_dev"

# Run migration
psql $DATABASE_URL -f migrations/001_create_users_table.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Step 3: Test Database Connection
```bash
cd /Users/shmunika/Documents/software/ai-projects/jobinder/backend/services/user-service

# Install PostgreSQL client
npm install pg @types/pg
```

---

## 🔧 Day 2: Repository Layer (3-4 hours)

### Step 1: Create Database Config
Create `src/config/database.ts`:
```typescript
import { Pool } from 'pg';
import { logger } from '../../../shared/utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('PostgreSQL client connected');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL client error:', err);
});

export { pool };
```

### Step 2: Create UserRepository
Create `src/repositories/UserRepository.ts`:
```typescript
import { pool } from '../config/database';
import { UserProfile } from '../../../shared/types/user';
import { logger } from '../../../shared/utils/logger';

export class UserRepository {
  async create(userId: string, userData: any): Promise<UserProfile> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const userQuery = `
        INSERT INTO users (
          id, email, user_type, first_name, last_name,
          location_city, location_state, location_country,
          location_lat, location_lng, email_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const userResult = await client.query(userQuery, [
        userId,
        userData.email,
        userData.userType,
        userData.firstName,
        userData.lastName,
        userData.location.city,
        userData.location.state,
        userData.location.country,
        userData.location.coordinates?.lat,
        userData.location.coordinates?.lng,
        false
      ]);
      
      await client.query('COMMIT');
      return this.mapToUserProfile(userResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(userId: string): Promise<UserProfile | null> {
    // TODO: Implement
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    // TODO: Implement
  }

  private mapToUserProfile(row: any): UserProfile {
    // TODO: Map database row to UserProfile type
  }
}
```

### Step 3: Test Repository
Create `tests/unit/repositories/UserRepository.test.ts`:
```typescript
import { UserRepository } from '../../../src/repositories/UserRepository';

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
  });

  describe('create', () => {
    it('should create a user in the database', async () => {
      // TODO: Implement test
    });
  });
});
```

---

## 🔐 Day 3-4: Authentication Service (4-6 hours)

### Step 1: Create AuthService
Create `src/services/AuthService.ts`:
```typescript
import { auth, firestore } from '../../../shared/config/firebase';
import { UserRepository } from '../repositories/UserRepository';
import { UserRegistrationRequest } from '../../../shared/types/user';
import { ServiceResponse } from '../../../shared/types/api';
import { logger } from '../../../shared/utils/logger';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async signUp(data: UserRegistrationRequest): Promise<ServiceResponse> {
    try {
      // 1. Create user in Firebase Auth
      const firebaseUser = await auth.createUser({
        email: data.email,
        password: data.password,
        emailVerified: false,
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // 2. Set custom claims
      await auth.setCustomUserClaims(firebaseUser.uid, {
        userType: data.userType,
      });

      // 3. Create user in PostgreSQL
      const user = await this.userRepo.create(firebaseUser.uid, {
        email: data.email,
        userType: data.userType,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
      });

      // 4. Create user profile document in Firestore (for real-time data)
      await firestore.collection('users').doc(firebaseUser.uid).set({
        email: data.email,
        userType: data.userType,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date(),
      });

      // 5. Generate custom token for immediate login
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      // 6. Send verification email
      const verificationLink = await auth.generateEmailVerificationLink(data.email);
      // TODO: Send email using EmailService

      return {
        success: true,
        data: {
          user,
          customToken,
        },
      };
    } catch (error: any) {
      logger.error('Sign-up error:', error);

      // Handle Firebase errors
      if (error.code === 'auth/email-already-exists') {
        return {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: 'Failed to create account',
          details: error.message,
        },
      };
    }
  }

  async verifyEmail(oobCode: string): Promise<ServiceResponse> {
    // TODO: Implement
  }

  async initiatePasswordReset(email: string): Promise<ServiceResponse> {
    // TODO: Implement
  }
}
```

### Step 2: Create AuthController
Create `src/controllers/AuthController.ts`:
```typescript
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { logger } from '../../../shared/utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    const userRepo = new UserRepository();
    this.authService = new AuthService(userRepo);
  }

  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.signUp(req.body);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Account created successfully. Please verify your email.',
        });
      } else {
        const statusCode = result.error?.code === 'EMAIL_EXISTS' ? 409 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Sign-up controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    // TODO: Implement
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    // TODO: Implement
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    // TODO: Implement
  }
}
```

### Step 3: Create Auth Routes
Create `src/routes/auth.ts`:
```typescript
import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { userRegistrationSchema } from '../validation/userSchemas';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const authController = new AuthController();

// Rate limiters for auth endpoints
const signUpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many accounts created from this IP, please try again later',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
});

// Public routes
router.post(
  '/signup',
  signUpLimiter,
  validateRequest(userRegistrationSchema),
  authController.signUp.bind(authController)
);

router.post(
  '/login',
  loginLimiter,
  authController.login.bind(authController)
);

router.post(
  '/verify-email',
  authController.verifyEmail.bind(authController)
);

router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);

export { router as authRoutes };
```

### Step 4: Register Routes in App
Update `src/app.ts`:
```typescript
// Add this import
import { authRoutes } from './routes/auth';

// Add this route (before the protected routes)
app.use('/api/auth', authRoutes);
```

---

## 📝 Day 5: Validation Schemas (1-2 hours)

Create `src/validation/authSchemas.ts`:
```typescript
import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  oobCode: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  oobCode: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});
```

---

## 🧪 Day 6: Testing (3-4 hours)

### Integration Test Example
Create `tests/integration/auth.test.ts`:
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/auth/signup', () => {
  it('should create a new user account', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        userType: 'job_seeker',
        location: {
          city: 'San Francisco',
          state: 'California',
          country: 'United States',
        },
        agreeToTerms: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  it('should reject duplicate email', async () => {
    // First signup
    await request(app).post('/api/auth/signup').send({ /* ... */ });

    // Second signup with same email
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ /* same data */ });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_EXISTS');
  });
});
```

---

## 🔍 Testing Your Implementation

### 1. Test Database Connection
```bash
cd backend/services/user-service
npm run dev

# Should see: "PostgreSQL client connected"
```

### 2. Test Sign-Up Endpoint
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "job_seeker",
    "location": {
      "city": "San Francisco",
      "state": "California",
      "country": "United States"
    },
    "agreeToTerms": true
  }'
```

### 3. Verify Database Entry
```bash
psql $DATABASE_URL -c "SELECT id, email, first_name, last_name FROM users;"
```

### 4. Check Firebase Console
- Go to Firebase Console → Authentication
- Verify user created
- Check custom claims

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
```bash
# Check PostgreSQL is running
psql $DATABASE_URL -c "SELECT version();"

# Check connection string
echo $DATABASE_URL
```

### Issue: Firebase Error
```bash
# Verify service account key exists
ls -la path/to/service-account.json

# Check environment variables
echo $FIREBASE_PROJECT_ID
```

### Issue: TypeScript Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📋 Implementation Checklist

### Database Setup
- [ ] PostgreSQL running
- [ ] Migration files created
- [ ] Tables created successfully
- [ ] Can query database

### Repository Layer
- [ ] `database.ts` created
- [ ] `UserRepository.ts` created
- [ ] Basic CRUD methods implemented
- [ ] Transaction support added

### Authentication Service
- [ ] `AuthService.ts` created
- [ ] Sign-up method implemented
- [ ] Firebase integration working
- [ ] PostgreSQL integration working
- [ ] Error handling added

### API Layer
- [ ] `AuthController.ts` created
- [ ] Auth routes created
- [ ] Validation schemas added
- [ ] Rate limiting configured
- [ ] Routes registered in app

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Error scenarios tested

---

## 🎯 Success Criteria

By the end of Week 1, you should be able to:
1. ✅ Create a new user account via API
2. ✅ User appears in PostgreSQL database
3. ✅ User appears in Firebase Auth
4. ✅ Duplicate email is rejected
5. ✅ Invalid data is validated
6. ✅ Rate limiting works
7. ✅ Tests pass

---

## 📞 Need Help?

- Review `docs/auth-implementation-plan.md` for detailed information
- Check Firebase docs: https://firebase.google.com/docs/auth
- Check PostgreSQL docs: https://www.postgresql.org/docs/
- Review existing code in `backend/services/user-service/`

---

**Ready to start? Begin with Day 1: Database Setup!**

