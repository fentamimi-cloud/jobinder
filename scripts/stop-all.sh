
#!/bin/bash

echo "🛑 Stopping Jobinder development environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop services using stored PIDs first
if [ -d ".pids" ]; then
    print_status "Stopping services using stored PIDs..."
    
    if [ -f ".pids/frontend.pid" ]; then
        FRONTEND_PID=$(cat .pids/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID && print_success "Frontend stopped (PID: $FRONTEND_PID)"
        fi
        rm -f .pids/frontend.pid
    fi
    
    if [ -f ".pids/user-service.pid" ]; then
        USER_SERVICE_PID=$(cat .pids/user-service.pid)
        if kill -0 $USER_SERVICE_PID 2>/dev/null; then
            kill $USER_SERVICE_PID && print_success "User Service stopped (PID: $USER_SERVICE_PID)"
        fi
        rm -f .pids/user-service.pid
    fi
    
    rmdir .pids 2>/dev/null || true
fi

# Fallback: kill by process name
print_status "Stopping any remaining Node.js processes..."
pkill -f "react-scripts" 2>/dev/null && print_success "React processes stopped" || true
pkill -f "ts-node" 2>/dev/null && print_success "TypeScript Node processes stopped" || true
pkill -f "npm start" 2>/dev/null && print_success "npm start processes stopped" || true

# Stop Docker services
print_status "Stopping Docker services..."
if [ -f "docker-compose.dev.yml" ]; then
    docker-compose -f docker-compose.dev.yml down
    print_success "Docker services stopped"
else
    print_warning "docker-compose.dev.yml not found, skipping Docker cleanup"
fi

# Wait a moment for processes to clean up
sleep 2

# Check remaining processes
print_status "Checking for remaining processes..."
REMAINING=$(ps aux | grep -E "(node|npm|react|ts-node)" | grep -v grep | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    print_warning "Some Node.js processes may still be running:"
    ps aux | grep -E "(node|npm|react|ts-node)" | grep -v grep | head -5
fi

# Check ports
print_status "Checking port availability..."
for port in 3000 3001 5432 6379 8080 9200; do
    if lsof -i :$port >/dev/null 2>&1; then
        print_warning "Port $port is still in use"
    else
        echo -e "   Port $port: ${GREEN}Available${NC}"
    fi
done

print_success "Jobinder development environment stopped!"
