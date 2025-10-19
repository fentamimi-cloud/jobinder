# 🏗️ Authentication Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATION                             │
│                      (Web/Mobile - React/React Native)                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         FIREBASE AUTHENTICATION                          │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Sign Up    │  │   Login      │  │ Password     │                 │
│  │              │  │              │  │ Reset        │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  Issues: ID Token (JWT) - Expires in 1 hour                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ ID Token in Authorization Header
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                        EXPRESS.JS API SERVER                             │
│                      (User Service - Port 3001)                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      MIDDLEWARE STACK                            │  │
│  │                                                                  │  │
│  │  1. Helmet (Security Headers)                                   │  │
│  │  2. CORS (Cross-Origin Resource Sharing)                        │  │
│  │  3. Rate Limiting (100 req/15min global, custom per endpoint)   │  │
│  │  4. Body Parser (JSON, max 10mb)                                │  │
│  │  5. Request Logger (Winston)                                    │  │
│  │  6. Authentication (Verify Firebase Token)                      │  │
│  │  7. Validation (Joi Schemas)                                    │  │
│  │  8. Error Handler                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         ROUTES                                   │  │
│  │                                                                  │  │
│  │  /api/auth/*        → AuthController                            │  │
│  │  /api/users/*       → UserController                            │  │
│  │  /health            → HealthController                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      CONTROLLERS                                 │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐                            │  │
│  │  │ AuthController│  │UserController│                            │  │
│  │  └──────┬───────┘  └──────┬───────┘                            │  │
│  │         │                  │                                     │  │
│  │         │                  │                                     │  │
│  │  ┌──────▼──────────────────▼───────┐                            │  │
│  │  │         SERVICES                │                            │  │
│  │  │                                 │                            │  │
│  │  │  ┌──────────────────────────┐  │                            │  │
│  │  │  │    AuthService           │  │                            │  │
│  │  │  │  - signUp()              │  │                            │  │
│  │  │  │  - verifyEmail()         │  │                            │  │
│  │  │  │  - resetPassword()       │  │                            │  │
│  │  │  └──────────────────────────┘  │                            │  │
│  │  │                                 │                            │  │
│  │  │  ┌──────────────────────────┐  │                            │  │
│  │  │  │    UserService           │  │                            │  │
│  │  │  │  - getProfile()          │  │                            │  │
│  │  │  │  - updateProfile()       │  │                            │  │
│  │  │  │  - deleteProfile()       │  │                            │  │
│  │  │  └──────────────────────────┘  │                            │  │
│  │  │                                 │                            │  │
│  │  │  ┌──────────────────────────┐  │                            │  │
│  │  │  │    EmailService          │  │                            │  │
│  │  │  │  - sendVerification()    │  │                            │  │
│  │  │  │  - sendPasswordReset()   │  │                            │  │
│  │  │  └──────────────────────────┘  │                            │  │
│  │  └─────────────────────────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      REPOSITORIES                                │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  UserRepository                                          │  │  │
│  │  │  - create(userId, userData)                             │  │  │
│  │  │  - findById(userId)                                     │  │  │
│  │  │  - findByEmail(email)                                   │  │  │
│  │  │  - update(userId, data)                                 │  │  │
│  │  │  - delete(userId)                                       │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  JobSeekerRepository                                     │  │  │
│  │  │  - createProfile(userId, profileData)                   │  │  │
│  │  │  - getProfile(userId)                                   │  │  │
│  │  │  - updateProfile(userId, data)                          │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  EmployerRepository                                      │  │  │
│  │  │  - createProfile(userId, profileData)                   │  │  │
│  │  │  - getProfile(userId)                                   │  │  │
│  │  │  - updateProfile(userId, data)                          │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
┌───────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   POSTGRESQL      │  │   FIRESTORE     │  │ FIREBASE STORAGE │
│                   │  │                 │  │                  │
│  Tables:          │  │  Collections:   │  │  Buckets:        │
│  - users          │  │  - users        │  │  - profiles/     │
│  - job_seeker_    │  │  - sessions     │  │  - resumes/      │
│    profiles       │  │  - activity     │  │  - logos/        │
│  - employer_      │  │                 │  │                  │
│    profiles       │  │                 │  │                  │
│  - education      │  │                 │  │                  │
│  - preferences    │  │                 │  │                  │
│  - sessions       │  │                 │  │                  │
│  - analytics      │  │                 │  │                  │
└───────────────────┘  └─────────────────┘  └──────────────────┘
```

---

## Authentication Flow Diagrams

### 1. Sign-Up Flow

```
┌─────────┐         ┌──────────┐         ┌─────────────┐         ┌──────────┐         ┌────────────┐
│ Client  │         │ Firebase │         │  API Server │         │PostgreSQL│         │  Firestore │
└────┬────┘         └────┬─────┘         └──────┬──────┘         └────┬─────┘         └─────┬──────┘
     │                   │                      │                     │                     │
     │  POST /auth/signup│                      │                     │                     │
     ├──────────────────────────────────────────►                     │                     │
     │  {email, password,│                      │                     │                     │
     │   firstName, ...} │                      │                     │                     │
     │                   │                      │                     │                     │
     │                   │    Validate Input    │                     │                     │
     │                   │ ◄────────────────────┤                     │                     │
     │                   │                      │                     │                     │
     │                   │  createUser()        │                     │                     │
     │                   ◄──────────────────────┤                     │                     │
     │                   │                      │                     │                     │
     │                   │  Returns: uid, token │                     │                     │
     │                   ├──────────────────────►                     │                     │
     │                   │                      │                     │                     │
     │                   │          setCustomUserClaims(uid, {type})  │                     │
     │                   ◄──────────────────────┤                     │                     │
     │                   │                      │                     │                     │
     │                   │                      │   INSERT INTO users │                     │
     │                   │                      ├─────────────────────►                     │
     │                   │                      │                     │                     │
     │                   │                      │   Returns: user row │                     │
     │                   │                      ◄─────────────────────┤                     │
     │                   │                      │                     │                     │
     │                   │                      │   INSERT INTO job_seeker_profiles         │
     │                   │                      ├─────────────────────►                     │
     │                   │                      │                     │                     │
     │                   │                      │            CREATE Firestore doc           │
     │                   │                      ├───────────────────────────────────────────►
     │                   │                      │                     │                     │
     │                   │  generateEmailVerificationLink()           │                     │
     │                   ◄──────────────────────┤                     │                     │
     │                   │                      │                     │                     │
     │                   │                      │   Send Email        │                     │
     │                   │                      ├─────────────►       │                     │
     │                   │                      │                     │                     │
     │  201 Created      │                      │                     │                     │
     ◄──────────────────────────────────────────┤                     │                     │
     │  {user, token}    │                      │                     │                     │
     │                   │                      │                     │                     │
```

### 2. Login Flow

```
┌─────────┐         ┌──────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │         │ Firebase │         │  API Server │         │PostgreSQL│
└────┬────┘         └────┬─────┘         └──────┬──────┘         └────┬─────┘
     │                   │                      │                     │
     │  Firebase SDK     │                      │                     │
     │  signInWithEmail  │                      │                     │
     ├───────────────────►                      │                     │
     │  AndPassword()    │                      │                     │
     │                   │                      │                     │
     │  ◄ Returns token  │                      │                     │
     ◄───────────────────┤                      │                     │
     │                   │                      │                     │
     │  POST /auth/login │                      │                     │
     ├──────────────────────────────────────────►                     │
     │  Authorization:   │                      │                     │
     │  Bearer <token>   │                      │                     │
     │                   │                      │                     │
     │                   │  verifyIdToken()     │                     │
     │                   ◄──────────────────────┤                     │
     │                   │                      │                     │
     │                   │  ◄ Returns uid, email│                     │
     │                   ├──────────────────────►                     │
     │                   │                      │                     │
     │                   │                      │   SELECT * FROM     │
     │                   │                      │   users WHERE id=?  │
     │                   │                      ├─────────────────────►
     │                   │                      │                     │
     │                   │                      │   ◄ Returns profile │
     │                   │                      ◄─────────────────────┤
     │                   │                      │                     │
     │                   │                      │   UPDATE last_login │
     │                   │                      ├─────────────────────►
     │                   │                      │                     │
     │                   │                      │   INSERT session    │
     │                   │                      ├─────────────────────►
     │                   │                      │                     │
     │  200 OK           │                      │                     │
     ◄──────────────────────────────────────────┤                     │
     │  {user profile}   │                      │                     │
     │                   │                      │                     │
```

### 3. Protected Request Flow

```
┌─────────┐         ┌──────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │         │ Firebase │         │  API Server │         │PostgreSQL│
└────┬────┘         └────┬─────┘         └──────┬──────┘         └────┬─────┘
     │                   │                      │                     │
     │  GET /users/profile                      │                     │
     ├──────────────────────────────────────────►                     │
     │  Authorization:   │                      │                     │
     │  Bearer <token>   │                      │                     │
     │                   │                      │                     │
     │                   │  Middleware:         │                     │
     │                   │  authenticateToken() │                     │
     │                   │                      │                     │
     │                   │  verifyIdToken()     │                     │
     │                   ◄──────────────────────┤                     │
     │                   │                      │                     │
     │                   │  ◄ uid, email, etc   │                     │
     │                   ├──────────────────────►                     │
     │                   │                      │                     │
     │                   │           req.user = {uid, email, ...}     │
     │                   │                      │                     │
     │                   │                      │   SELECT profile    │
     │                   │                      ├─────────────────────►
     │                   │                      │                     │
     │                   │                      │   ◄ Returns data    │
     │                   │                      ◄─────────────────────┤
     │                   │                      │                     │
     │  200 OK           │                      │                     │
     ◄──────────────────────────────────────────┤                     │
     │  {profile data}   │                      │                     │
     │                   │                      │                     │
```

---

## Data Storage Strategy

### Why Multiple Databases?

| Database | Purpose | Data Stored | Reason |
|----------|---------|-------------|---------|
| **Firebase Auth** | Authentication | User credentials, email verification status | Industry-standard auth, built-in security |
| **PostgreSQL** | Relational data | User profiles, preferences, analytics | Complex queries, transactions, data integrity |
| **Firestore** | Real-time data | User activity, sessions, notifications | Real-time updates, offline support |
| **Firebase Storage** | Files | Profile pictures, resumes, logos | Scalable file storage, CDN integration |

### Data Synchronization

```
When user signs up:
1. Create in Firebase Auth (source of truth for credentials)
2. Create in PostgreSQL (source of truth for profile data)
3. Create in Firestore (for real-time features)

When user updates profile:
1. Update PostgreSQL (primary store)
2. Update Firestore (if real-time fields changed)

When user logs in:
1. Verify with Firebase Auth
2. Fetch profile from PostgreSQL
3. Update session in PostgreSQL
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
  ├─ HTTPS Only (TLS 1.3)
  ├─ CORS Configuration (whitelist origins)
  └─ Firewall Rules (if deployed)

Layer 2: API Gateway (Express Middleware)
  ├─ Helmet (Security Headers)
  ├─ Rate Limiting (DDoS protection)
  ├─ Request Size Limits (10MB max)
  └─ IP Blocking (future)

Layer 3: Authentication
  ├─ Firebase Token Verification
  ├─ Token Expiry (1 hour)
  ├─ Custom Claims (user roles)
  └─ Session Validation

Layer 4: Authorization
  ├─ Role-Based Access Control (RBAC)
  ├─ Resource Ownership Checks
  └─ Privacy Settings Enforcement

Layer 5: Input Validation
  ├─ Joi Schema Validation
  ├─ SQL Injection Prevention (parameterized queries)
  ├─ XSS Prevention (sanitization)
  └─ Email/Phone Validation

Layer 6: Data Security
  ├─ Password Hashing (Firebase/bcrypt)
  ├─ Sensitive Data Encryption
  ├─ Audit Logging
  └─ GDPR Compliance

Layer 7: Monitoring & Alerting
  ├─ Failed Login Tracking
  ├─ Suspicious Activity Detection
  ├─ Error Logging (Winston)
  └─ Security Alerts
```

---

## Technology Decisions & Rationale

### ✅ Why Firebase Authentication?

**Pros:**
- Battle-tested, industry standard
- Built-in security features (bcrypt hashing, brute force protection)
- Email verification out of the box
- Social auth ready (Google, GitHub, etc.)
- Token management handled automatically
- Scales automatically

**Cons:**
- Vendor lock-in (mitigated by keeping user data in PostgreSQL)
- Limited customization (mitigated by custom claims)

**Decision:** Use Firebase for auth, PostgreSQL for data

---

### ✅ Why PostgreSQL for User Data?

**Pros:**
- ACID transactions
- Complex queries (JOINs, aggregations)
- Data integrity (foreign keys, constraints)
- Full control over data
- Better for analytics
- No vendor lock-in

**Cons:**
- Requires more setup
- Need to manage scaling

**Decision:** PostgreSQL as primary data store

---

### ✅ Why Firestore for Sessions?

**Pros:**
- Real-time updates
- Offline support
- Serverless (no server management)
- Integrates with Firebase Auth
- Good for presence detection

**Cons:**
- Query limitations
- Costs can add up with high volume

**Decision:** Use for real-time features, sessions, and notifications

---

## API Endpoint Overview

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/signup` | No | 3/hour | Create new account |
| POST | `/login` | Yes (Firebase) | 5/15min | Validate login and sync data |
| POST | `/verify-email` | No | 5/hour | Verify email with code |
| POST | `/forgot-password` | No | 3/hour | Request password reset |
| POST | `/reset-password` | No | 3/hour | Reset password with code |
| POST | `/logout` | Yes | 10/min | Invalidate session |
| POST | `/refresh-token` | No | 10/min | Get new ID token |

### User Endpoints (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update profile |
| DELETE | `/profile` | Yes | Delete account |
| GET | `/profile/:userId` | Yes | Get public profile |
| POST | `/profile/complete-onboarding` | Yes | Mark onboarding complete |

### Admin Endpoints (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Admin | Get all users |
| PUT | `/:userId/status` | Admin | Update user status |

---

## Environment Variables

### Required for Authentication

```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/service-account.json

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_POOL_MAX=20

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@jobinder.com

# Security
JWT_SECRET=your-secret-key
SESSION_EXPIRY=86400
BCRYPT_ROUNDS=12

# API
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

---

## Performance Considerations

### Database Optimization
- Connection pooling (20 connections)
- Indexes on frequently queried fields
- Database views for complex queries
- Query result caching (future: Redis)

### API Optimization
- Response compression (gzip)
- JSON payload size limits
- Async/await for non-blocking I/O
- Load balancing (future: multiple instances)

### Caching Strategy (Future)
```
Redis Cache:
├─ User profiles (TTL: 15 minutes)
├─ Session data (TTL: 1 hour)
└─ Public profiles (TTL: 1 hour)

Cache invalidation:
├─ On profile update
├─ On logout
└─ On account deletion
```

---

## Testing Strategy

### Unit Tests (80%+ coverage target)
- Services (AuthService, UserService)
- Repositories (UserRepository, JobSeekerRepository)
- Middleware (auth, validation)
- Utilities (helpers, formatters)

### Integration Tests
- API endpoints
- Database operations
- Firebase integration
- Email sending

### E2E Tests
- Complete sign-up flow
- Complete login flow
- Password reset flow
- Profile update flow

### Security Tests
- SQL injection attempts
- XSS attempts
- Rate limiting enforcement
- Token expiry handling
- Invalid input handling

---

## Monitoring & Logging

### What to Log

```typescript
// Authentication Events
logger.info('User signed up', { userId, email, userType });
logger.info('User logged in', { userId, email });
logger.warn('Failed login attempt', { email, ipAddress });
logger.error('Authentication error', { error, email });

// Security Events
logger.warn('Rate limit exceeded', { ipAddress, endpoint });
logger.warn('Invalid token', { token: 'REDACTED', ipAddress });
logger.error('SQL injection attempt', { query, ipAddress });

// Business Events
logger.info('Profile updated', { userId, fields: ['firstName', 'bio'] });
logger.info('Account deleted', { userId });
```

### Metrics to Track
- Sign-ups per day/week/month
- Active users
- Failed login attempts
- Average response times
- Database query performance
- Error rates by endpoint

---

## Deployment Checklist

### Before Production
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Environment variables set in production
- [ ] Database migrations run
- [ ] Firebase project created (production)
- [ ] SSL certificates configured
- [ ] CORS configured for production domain
- [ ] Rate limits configured appropriately
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Rollback plan documented
- [ ] API documentation published
- [ ] Team trained on new system

---

**This document provides a high-level overview of the authentication system architecture. Refer to `auth-implementation-plan.md` for detailed implementation steps.**

