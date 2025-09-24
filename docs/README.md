# Start Docker services
npm run docker:up

# Start backend services (in one terminal)
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend


Explore the Services
Database Management: Visit http://localhost:8080 (Adminer)
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