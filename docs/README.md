# Start Docker services
npm run docker:up

# Start backend services (in one terminal)
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend


Explore the Services
Database Management: Visit http://localhost:8081 (Adminer)
Server: postgres, User: jobinder, Password: password, DB: jobinder_dev
Email Testing: Visit http://localhost:8025 (MailHog)
File Storage: Visit http://localhost:9001 (MinIO Console)
Username: minioadmin, Password: minioadmin
Search Engine: Visit http://localhost:9200 (Elasticsearch API)

# Start Backend Services 
# Start individual services
cd backend/services/user-service && npm run dev      # Port 3001
cd backend/services/job-service && npm run dev       # Port 3002
cd backend/services/matching-service && npm run dev 

# Start Frontend Application
cd frontend/web && npm start 

💡 What You Can Build Now
✅ User authentication - Firebase integration ready
✅ Job posting system - Database schemas created
✅ AI matching engine - ML pipeline architecture ready
✅ Real-time swiping - WebSocket infrastructure prepared
✅ Meeting scheduling - Calendar integration setup
✅ File uploads - S3-compatible storage running