# 🚀 Jobinder Development Quick Start Guide

## Starting the Development Environment

### Option 1: Using npm scripts (Recommended)
```bash
npm start
```

### Option 2: Direct script execution
```bash
./scripts/start.sh
```

## What the Start Script Does

1. **Prerequisites Check** - Verifies Node.js, npm, Docker are installed
2. **Service Cleanup** - Stops any existing services to avoid conflicts
3. **Infrastructure Start** - Launches Docker services (PostgreSQL, Redis, etc.)
4. **Dependency Check** - Installs missing npm dependencies
5. **Backend Services** - Starts the user service API
6. **Frontend** - Launches the React development server

## Services Started

### Infrastructure (Docker)
- **PostgreSQL**: `localhost:5432` - Main database
- **Redis**: `localhost:6379` - Caching and sessions
- **Elasticsearch**: `http://localhost:9200` - Search functionality
- **Firebase Emulator**: `http://localhost:4000` - Auth and Firestore
- **Adminer**: `http://localhost:8081` - Database management UI
- **MailHog**: `http://localhost:8025` - Email testing
- **MinIO**: `http://localhost:9001` - S3-compatible storage

### Application Services
- **User Service API**: `http://localhost:3001` - Backend API
- **Frontend Web App**: `http://localhost:3000` - React application

## Monitoring & Logs

### View Logs
```bash
# User service logs
tail -f logs/user-service.log

# Frontend logs
tail -f logs/frontend.log

# All Docker services
docker-compose -f docker-compose.dev.yml logs -f

# Specific Docker service
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Check Service Status
```bash
./scripts/status.sh
```

## Stopping Services

### Option 1: Using npm scripts
```bash
npm stop
```

### Option 2: Direct script execution
```bash
./scripts/stop-all.sh
```

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
```bash
# Stop everything first
npm stop

# Check for lingering processes
lsof -i :3000 :3001 :5432 :6379

# Kill specific processes if needed
kill -9 <PID>
```

### Service Won't Start
1. Check logs in the `logs/` directory
2. Ensure all dependencies are installed:
   ```bash
   npm install
   cd backend/services/user-service && npm install
   cd ../../../frontend/web && npm install --legacy-peer-deps
   ```
3. Restart Docker if infrastructure services fail:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up -d
   ```

### Clean Start
For a completely fresh start:
```bash
# Stop everything
npm stop

# Clean up
rm -rf .pids logs/*.log
docker-compose -f docker-compose.dev.yml down -v

# Restart
npm start
```

## Development Workflow

1. **Start services**: `npm start`
2. **Open application**: http://localhost:3000
3. **API testing**: http://localhost:3001
4. **Database management**: http://localhost:8080
5. **Monitor logs**: `tail -f logs/*.log`
6. **Stop when done**: `npm stop`

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start entire development environment |
| `npm stop` | Stop all services |
| `npm run dev:frontend` | Start only frontend |
| `npm run dev:user-service` | Start only user service |
| `npm run docker:up` | Start only Docker services |
| `npm run docker:down` | Stop only Docker services |

---

🎉 **Happy coding!** Open http://localhost:3000 to start using Jobinder!


