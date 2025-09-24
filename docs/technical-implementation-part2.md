# Jobinder - Technical Implementation Guide (Part 2)

## Real-time Features

### WebSocket Implementation

```typescript
// backend/services/notification-service/src/services/WebSocketService.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authenticateSocket } from '../middleware/socketAuth';
import { logger } from '../utils/logger';
import { PubSubService } from './PubSubService';

export class WebSocketService {
  private io: SocketIOServer;
  private pubsubService: PubSubService;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
        methods: ["GET", "POST"]
      }
    });

    this.pubsubService = new PubSubService();
    this.setupSocketHandlers();
    this.setupPubSubSubscriptions();
  }

  private setupSocketHandlers(): void {
    this.io.use(authenticateSocket);

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      
      logger.info(`User ${userId} connected via WebSocket`);
      this.connectedUsers.set(userId, socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Handle user going online
      this.broadcastUserStatus(userId, 'online');

      // Handle real-time match interactions
      socket.on('swipe_action', async (data) => {
        await this.handleSwipeAction(socket, data);
      });

      // Handle typing indicators in chat
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected`);
        this.connectedUsers.delete(userId);
        this.broadcastUserStatus(userId, 'offline');
      });

      // Send any pending notifications
      this.sendPendingNotifications(userId);
    });
  }

  private async handleSwipeAction(socket: any, data: any): Promise<void> {
    try {
      const { targetId, action, userType } = data;
      const userId = socket.data.userId;

      // Publish swipe event for processing
      await this.pubsubService.publishSwipeEvent({
        userId,
        userType,
        targetId,
        action,
        timestamp: new Date().toISOString()
      });

      // If it's a like, check for mutual interest in real-time
      if (action === 'like') {
        const mutualMatch = await this.checkMutualMatch(userId, targetId, userType);
        
        if (mutualMatch) {
          // Notify both users of the match
          this.notifyMatch(userId, targetId, mutualMatch);
        }
      }

      socket.emit('swipe_processed', { success: true, targetId, action });

    } catch (error) {
      logger.error('Error handling swipe action:', error);
      socket.emit('swipe_error', { error: 'Failed to process swipe' });
    }
  }

  private async checkMutualMatch(userId: string, targetId: string, userType: string): Promise<any> {
    // Implementation to check if there's a mutual match
    // This would query the database to see if both parties have liked each other
    // Return match object if mutual interest exists
    return null; // Placeholder
  }

  private notifyMatch(userId1: string, userId2: string, matchData: any): void {
    const matchNotification = {
      type: 'new_match',
      matchId: matchData.id,
      timestamp: new Date().toISOString(),
      data: matchData
    };

    // Send to both users
    this.io.to(`user:${userId1}`).emit('match_notification', matchNotification);
    this.io.to(`user:${userId2}`).emit('match_notification', matchNotification);
  }

  // Additional methods...
}
```

### Socket Authentication Middleware

```typescript
// backend/services/notification-service/src/middleware/socketAuth.ts
import { Socket } from 'socket.io';
import { auth } from '../config/firebase-admin';
import { logger } from '../utils/logger';

export async function authenticateSocket(socket: Socket, next: Function): Promise<void> {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const cleanToken = token.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(cleanToken);

    // Attach user data to socket
    socket.data.userId = decodedToken.uid;
    socket.data.email = decodedToken.email;
    socket.data.emailVerified = decodedToken.email_verified;

    logger.info(`Socket authenticated for user: ${decodedToken.uid}`);
    next();

  } catch (error) {
    logger.error('Socket authentication failed:', error);
    next(new Error('Invalid authentication token'));
  }
}
```

---

## File Upload & Processing

### File Upload Service

```typescript
// backend/services/file-service/src/services/FileUploadService.ts
import { Storage } from '@google-cloud/storage';
import { Request } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from '../utils/logger';
import { DocumentProcessingService } from './DocumentProcessingService';

export class FileUploadService {
  private storage: Storage;
  private bucket: string;
  private documentProcessor: DocumentProcessingService;

  constructor() {
    this.storage = new Storage();
    this.bucket = process.env.STORAGE_BUCKET!;
    this.documentProcessor = new DocumentProcessingService();
  }

  // Multer configuration for file uploads
  public getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per request
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb) => {
        this.validateFile(file, cb);
      }
    });
  }

  private validateFile(file: Express.Multer.File, cb: multer.FileFilterCallback): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
    }
  }

  public async uploadFile(
    file: Express.Multer.File,
    userId: string,
    fileType: 'resume' | 'profile_picture' | 'company_logo'
  ): Promise<{ url: string; metadata: any }> {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileType}/${userId}/${fileId}${fileExtension}`;

      // Upload to Cloud Storage
      const bucketFile = this.storage.bucket(this.bucket).file(fileName);
      
      const stream = bucketFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: userId,
            originalName: file.originalname,
            fileType,
            uploadedAt: new Date().toISOString()
          }
        },
        resumable: false
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          logger.error('File upload error:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            // Make file publicly readable
            await bucketFile.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
            
            // Process file based on type
            let processedData = {};
            if (fileType === 'resume') {
              processedData = await this.documentProcessor.processResume(publicUrl, file.buffer);
            } else if (fileType === 'profile_picture' || fileType === 'company_logo') {
              processedData = await this.processImage(file.buffer);
            }

            // Store file metadata in database
            const metadata = await this.storeFileMetadata({
              fileId,
              fileName,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              url: publicUrl,
              userId,
              fileType,
              processedData,
              uploadedAt: new Date()
            });

            resolve({
              url: publicUrl,
              metadata
            });

          } catch (error) {
            logger.error('Post-upload processing error:', error);
            reject(error);
          }
        });

        stream.end(file.buffer);
      });

    } catch (error) {
      logger.error('File upload service error:', error);
      throw error;
    }
  }

  // Additional methods for file management...
}
```

### Document Processing Service

```typescript
// backend/services/file-service/src/services/DocumentProcessingService.ts
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import * as pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger';

export class DocumentProcessingService {
  private documentProcessor: DocumentProcessorServiceClient;
  private processorId: string;
  private projectId: string;
  private location: string;

  constructor() {
    this.documentProcessor = new DocumentProcessorServiceClient();
    this.processorId = process.env.DOCUMENT_AI_PROCESSOR_ID!;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT!;
    this.location = process.env.DOCUMENT_AI_LOCATION || 'us';
  }

  public async processResume(fileUrl: string, fileBuffer: Buffer): Promise<any> {
    try {
      // Try Document AI first for better results
      let extractedData;
      
      try {
        extractedData = await this.processWithDocumentAI(fileBuffer);
      } catch (aiError) {
        logger.warn('Document AI processing failed, falling back to manual parsing:', aiError);
        extractedData = await this.processWithManualParsing(fileBuffer, fileUrl);
      }

      // Post-process and structure the data
      const structuredData = await this.structureResumeData(extractedData);

      return structuredData;

    } catch (error) {
      logger.error('Resume processing error:', error);
      throw error;
    }
  }

  private async processWithDocumentAI(fileBuffer: Buffer): Promise<any> {
    const name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;

    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: 'application/pdf', // Adjust based on file type
      },
    };

    const [result] = await this.documentProcessor.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error('No document returned from Document AI');
    }

    // Extract structured data from Document AI response
    return this.parseDocumentAIResponse(document);
  }

  // Additional methods for document processing...
}
```

---

## Infrastructure & Deployment

### Terraform Configuration

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

# VPC Network
resource "google_compute_network" "jobinder_vpc" {
  name                    = "jobinder-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "jobinder_subnet" {
  name          = "jobinder-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.jobinder_vpc.id

  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/22"
  }
}

# Firestore Database
resource "google_firestore_database" "jobinder_firestore" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_app_engine_application.app]
}

# App Engine (required for Firestore)
resource "google_app_engine_application" "app" {
  project     = var.project_id
  location_id = var.region
}

# Cloud SQL Instance
resource "google_sql_database_instance" "jobinder_postgres" {
  name             = "jobinder-postgres-${var.environment}"
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier = var.environment == "prod" ? "db-custom-2-7680" : "db-f1-micro"

    database_flags {
      name  = "log_statement"
      value = "all"
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.jobinder_vpc.id
      require_ssl     = true

      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = var.environment == "prod"
}

# Cloud Run Services
resource "google_cloud_run_service" "user_service" {
  name     = "user-service-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/user-service:latest"
        
        ports {
          container_port = 3000
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "FIRESTORE_PROJECT_ID"
          value = var.project_id
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
      }

      container_concurrency = 80
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "100"
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.name
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# VPC Connector
resource "google_vpc_access_connector" "connector" {
  name          = "jobinder-connector-${var.environment}"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.jobinder_vpc.name
  region        = var.region
}

# Storage Buckets
resource "google_storage_bucket" "jobinder_files" {
  name          = "jobinder-files-${var.project_id}-${var.environment}"
  location      = "US"
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365 # Delete files older than 1 year
    }
  }

  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 30 # Move to nearline after 30 days
    }
  }
}

# Outputs
output "database_connection_name" {
  value = google_sql_database_instance.jobinder_postgres.connection_name
}

output "storage_bucket_name" {
  value = google_storage_bucket.jobinder_files.name
}
```

### Docker Configuration

```dockerfile
# backend/services/user-service/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application and dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const req = http.get(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => { req.destroy(); process.exit(1); });"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
```

---

## Development Workflow

### Local Development Setup

```bash
#!/bin/bash
# scripts/setup-local-dev.sh

set -e

echo "Setting up Jobinder local development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo "Google Cloud SDK is required but not installed. Aborting." >&2; exit 1; }

# Create environment files
echo "Creating environment configuration..."

# Backend environment
cat > backend/.env.local <<EOF
NODE_ENV=development
PORT=3000

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Database
DATABASE_URL=postgresql://jobinder:password@localhost:5432/jobinder_dev
REDIS_URL=redis://localhost:6379

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
STORAGE_BUCKET=jobinder-files-dev
VERTEX_AI_ENDPOINT=your-vertex-ai-endpoint
DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# External APIs
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id
EOF

# Frontend environment
cat > frontend/web/.env.local <<EOF
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
EOF

# Start local services with Docker Compose
echo "Starting local services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Run database migrations
echo "Running database migrations..."
cd backend/shared/database
npm install
npm run migrate

echo "Local development environment setup complete!"
```

### Docker Compose for Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: jobinder_dev
      POSTGRES_USER: jobinder
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/shared/database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  firebase-emulator:
    image: andreysenov/firebase-tools
    command: firebase emulators:start --only firestore,auth --project demo-project
    ports:
      - "9099:9099"  # Auth emulator
      - "8080:8080"  # Firestore emulator
    volumes:
      - ./firebase.json:/home/node/firebase.json
      - ./firestore.rules:/home/node/firestore.rules

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_SA_KEY: ${{ secrets.GCP_SA_KEY }}
  REGISTRY_HOSTNAME: gcr.io

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: jobinder_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        npm ci
        cd backend/services/user-service && npm ci
        cd ../job-service && npm ci
        cd ../matching-service && pip install -r requirements.txt
        cd ../../../frontend/web && npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: |
        npm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/jobinder_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run security audit
      run: npm run security:audit

  build-and-deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - name: Configure Docker to use gcloud as a credential helper
      run: gcloud auth configure-docker
    
    - name: Build and push Docker images
      run: |
        # Build user service
        docker build -t $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA \
          backend/services/user-service
        docker push $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA
        
        # Build job service
        docker build -t $REGISTRY_HOSTNAME/$PROJECT_ID/job-service:$GITHUB_SHA \
          backend/services/job-service
        docker push $REGISTRY_HOSTNAME/$PROJECT_ID/job-service:$GITHUB_SHA
    
    - name: Deploy to Cloud Run (Staging)
      run: |
        gcloud run deploy user-service-staging \
          --image $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated \
          --set-env-vars NODE_ENV=staging
        
        gcloud run deploy job-service-staging \
          --image $REGISTRY_HOSTNAME/$PROJECT_ID/job-service:$GITHUB_SHA \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated \
          --set-env-vars NODE_ENV=staging

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - name: Configure Docker to use gcloud as a credential helper
      run: gcloud auth configure-docker
    
    - name: Build and push Docker images
      run: |
        # Build with production optimizations
        docker build -t $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA \
          --build-arg NODE_ENV=production \
          backend/services/user-service
        docker push $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA
        
        docker build -t $REGISTRY_HOSTNAME/$PROJECT_ID/job-service:$GITHUB_SHA \
          --build-arg NODE_ENV=production \
          backend/services/job-service
        docker push $REGISTRY_HOSTNAME/$PROJECT_ID/job-service:$GITHUB_SHA
    
    - name: Deploy to Cloud Run (Production)
      run: |
        gcloud run deploy user-service-prod \
          --image $REGISTRY_HOSTNAME/$PROJECT_ID/user-service:$GITHUB_SHA \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated \
          --set-env-vars NODE_ENV=production \
          --min-instances 2 \
          --max-instances 100
```

## Summary

This comprehensive technical implementation guide provides a complete foundation for building Jobinder with:

- **Real-time WebSocket implementation** for live updates and interactions
- **Advanced file upload and processing** with Document AI integration
- **Production-ready infrastructure** using Terraform and GCP services
- **Complete development workflow** with local setup and CI/CD pipelines
- **Security, scalability, and maintainability** best practices throughout

The implementation is designed to handle the full complexity of a modern job matching platform while maintaining code quality, performance, and developer experience.
