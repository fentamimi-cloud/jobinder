#!/bin/bash

set -e

echo "🚀 Starting Jobinder development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_service() {
    echo -e "${CYAN}[SERVICE]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if eval $check_command >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name is not ready after $((max_attempts * 2)) seconds"
    return 1
}

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -f "docker-compose.dev.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check prerequisites
print_step "1/6 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { 
    print_error "Node.js is required but not installed. Run: brew install node"
    exit 1
}

command -v npm >/dev/null 2>&1 || { 
    print_error "npm is required but not installed."
    exit 1
}

command -v docker >/dev/null 2>&1 || { 
    print_error "Docker is required but not installed. Install Docker Desktop."
    exit 1
}

command -v docker-compose >/dev/null 2>&1 || { 
    print_error "docker-compose is required but not installed."
    exit 1
}

print_success "All prerequisites are available!"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current: $(node --version)"
    exit 1
fi

print_success "Node.js version $(node --version) is compatible!"

# Stop any existing services
print_step "2/6 Stopping any existing services..."
./scripts/stop-all.sh >/dev/null 2>&1 || true

# Start Docker infrastructure services
print_step "3/6 Starting infrastructure services..."
print_service "Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for infrastructure services
print_status "Waiting for infrastructure services to be ready..."

# Wait for core services (required)
wait_for_service "PostgreSQL" "docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U jobinder -d jobinder_dev"
wait_for_service "Redis" "docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping"

# Wait for optional services (continue even if they fail)
print_status "Checking optional services..."
wait_for_service "Elasticsearch" "curl -s http://localhost:9200/_cluster/health" 15 || print_warning "Elasticsearch not ready, continuing anyway"
wait_for_service "Firebase Emulator" "curl -s http://localhost:4000" 10 || print_warning "Firebase Emulator not ready, continuing anyway"

print_success "Infrastructure services are ready!"

# Install dependencies if needed
print_step "4/6 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/services/user-service/node_modules" ]; then
    print_status "Installing user service dependencies..."
    cd backend/services/user-service && npm install && cd ../../..
fi

if [ ! -d "frontend/web/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend/web && npm install --legacy-peer-deps && cd ../..
fi

print_success "Dependencies are ready!"

# Start backend services
print_step "5/6 Starting backend services..."

# Start user service
print_service "Starting User Service on port 3001..."
cd backend/services/user-service
npm run dev > ../../../logs/user-service.log 2>&1 &
USER_SERVICE_PID=$!
cd ../../..

# Wait a moment for the service to start
sleep 3

# Check if user service started successfully
if kill -0 $USER_SERVICE_PID 2>/dev/null; then
    print_success "User Service started (PID: $USER_SERVICE_PID)"
else
    print_error "User Service failed to start. Check logs/user-service.log"
    exit 1
fi

# Start frontend
print_step "6/6 Starting frontend..."

print_service "Starting React Frontend on port 3000..."
cd frontend/web
PORT=3000 npm start > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
wait_for_service "Frontend" "curl -s http://localhost:3000"

print_success "Frontend started (PID: $FRONTEND_PID)"

# Store PIDs for cleanup
mkdir -p .pids
echo $USER_SERVICE_PID > .pids/user-service.pid
echo $FRONTEND_PID > .pids/frontend.pid

# Display running services
echo ""
echo "🎉 ${GREEN}Jobinder Development Environment Started!${NC}"
echo ""
echo "📋 ${BLUE}Running Services:${NC}"
echo "   🔧 Infrastructure Services (Docker):"
echo "      • PostgreSQL: localhost:5432"
echo "      • Redis: localhost:6379"
echo "      • Elasticsearch: http://localhost:9200"
echo "      • Firebase Emulator: http://localhost:4000"
echo "      • Adminer (DB UI): http://localhost:8081"
echo "      • MailHog (Email): http://localhost:8025"
echo "      • MinIO (Storage): http://localhost:9001"
echo ""
echo "   🚀 Application Services:"
echo "      • User Service API: http://localhost:3001"
echo "      • Frontend Web App: http://localhost:3000"
echo ""
echo "📊 ${YELLOW}Monitoring:${NC}"
echo "   • Logs directory: ./logs/"
echo "   • User Service logs: tail -f logs/user-service.log"
echo "   • Frontend logs: tail -f logs/frontend.log"
echo "   • Docker logs: docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 ${RED}To stop all services:${NC}"
echo "   ./scripts/stop-all.sh"
echo ""
echo "✨ ${GREEN}Happy coding!${NC} Open http://localhost:3000 to start using Jobinder!"
