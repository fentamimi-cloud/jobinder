# 🚀 Jobinder - AI-Powered Job Matching Platform

Jobinder is like "Tinder for jobs" - a revolutionary job matching platform that uses AI to connect job seekers with the perfect opportunities and helps employers find ideal candidates through a mutual selection process.

## ✨ Features

- **Smart Matching**: AI-powered algorithm that analyzes resumes and job requirements
- **Swipe Interface**: Tinder-like experience for both job seekers and employers
- **Real-time Notifications**: Instant alerts for matches and messages
- **Automated Scheduling**: AI schedules meetings when both parties express interest
- **Resume Intelligence**: Document AI extracts and analyzes resume content
- **Multi-platform**: Web and mobile applications

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Material-UI
- **Backend**: Microservices with Node.js/TypeScript and Python
- **Database**: Firestore (NoSQL) + PostgreSQL (Analytics)
- **AI/ML**: Google Cloud Vertex AI, Document AI, AutoML
- **Infrastructure**: Google Cloud Platform (GCP)
- **Real-time**: WebSockets for live updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Google Cloud SDK (optional, for production)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd jobinder
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### 2. Configure Environment

```bash
# Copy and edit environment variables
cp env.example .env.local

# Edit .env.local with your configuration:
# - Firebase project settings
# - GCP credentials
# - API keys (SendGrid, Twilio, etc.)
```

### 3. Start Development Environment

```bash
# Start Docker services (PostgreSQL, Redis, etc.)
npm run docker:up

# Start backend services
npm run dev:backend

# In another terminal, start frontend
npm run dev:frontend
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **API Documentation**: http://localhost:3001/docs
- **Firebase Emulator UI**: http://localhost:4000
- **Database Admin**: http://localhost:8080
- **Email Testing**: http://localhost:8025

## 📁 Project Structure

```
jobinder/
├── backend/
│   ├── services/
│   │   ├── user-service/          # User management
│   │   ├── job-service/           # Job postings
│   │   ├── matching-service/      # AI matching (Python)
│   │   ├── swipe-service/         # Swipe logic
│   │   ├── notification-service/  # Notifications
│   │   ├── meeting-service/       # Meeting scheduling
│   │   └── file-service/          # File uploads
│   └── shared/                    # Shared utilities
├── frontend/
│   ├── web/                       # React web app
│   └── mobile/                    # React Native app
├── infrastructure/
│   ├── terraform/                 # GCP infrastructure
│   └── kubernetes/                # K8s deployments
├── docs/                          # Documentation
└── scripts/                       # Setup scripts
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                 # Start all services
npm run dev:backend         # Backend services only
npm run dev:frontend        # Frontend only

# Testing
npm test                    # Run all tests
npm run test:backend        # Backend tests
npm run test:frontend       # Frontend tests
npm run test:e2e           # End-to-end tests

# Database
npm run db:migrate         # Run migrations
npm run db:seed           # Seed test data
npm run db:reset          # Reset database

# Code Quality
npm run lint              # Lint all code
npm run lint:fix          # Fix linting issues
npm run format            # Format code

# Docker
npm run docker:up         # Start services
npm run docker:down       # Stop services
npm run docker:logs       # View logs
```

### Environment Configuration

Key environment variables to configure:

```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_AI_ENDPOINT=your-vertex-ai-endpoint
DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# External APIs
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
```

## 🤖 AI/ML Features

### Matching Algorithm

The AI matching system uses multiple signals:

- **Skills Analysis**: NLP analysis of resume skills vs job requirements
- **Experience Matching**: Years and level of experience comparison
- **Location Compatibility**: Geographic preferences and remote work
- **Culture Fit**: Company values vs candidate preferences
- **Success Prediction**: Historical data to predict hiring success

### Document Processing

- **Resume Parsing**: Extract structured data from PDFs/DOCX
- **Skill Extraction**: Identify technical and soft skills
- **Experience Analysis**: Parse work history and achievements
- **Education Verification**: Extract degree and certification info

## 📊 Analytics & Monitoring

### Business Metrics

- User engagement and retention
- Match quality and conversion rates
- Time to hire metrics
- Revenue and growth tracking

### Technical Metrics

- API performance and error rates
- Database query optimization
- ML model accuracy and drift
- Infrastructure costs and scaling

## 🚀 Deployment

### Staging Deployment

```bash
npm run deploy:staging
```

### Production Deployment

```bash
npm run deploy:prod
```

### Infrastructure

The application is designed for Google Cloud Platform:

- **Compute**: Cloud Run (serverless containers)
- **Database**: Firestore + Cloud SQL
- **Storage**: Cloud Storage
- **AI/ML**: Vertex AI, Document AI, AutoML
- **Monitoring**: Cloud Monitoring, Logging

## 📚 Documentation

- [Architecture Proposals](docs/architecture-proposals.md)
- [Technical Implementation](docs/technical-implementation.md)
- [GCP Cost Estimation](docs/gcp-cost-estimation.md)
- [Implementation Plan](docs/implementation-plan.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Follow the established code style (enforced by ESLint/Prettier)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` folder
- **Email**: support@jobinder.com

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- [x] User authentication and profiles
- [x] Basic job posting and search
- [x] Simple matching algorithm
- [x] Swipe interface
- [x] Basic messaging

### Phase 2 (AI Integration) 🚧
- [ ] Advanced ML matching
- [ ] Resume intelligence
- [ ] Predictive analytics
- [ ] Real-time notifications

### Phase 3 (Scale) 📅
- [ ] Mobile applications
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] Multi-market support

---

Built with ❤️ by the Jobinder Team