#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

print_header() {
    echo -e "\n${WHITE}=== $1 ===${NC}"
}

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "ok" ]; then
        echo -e "  ${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "  ${YELLOW}⚠️  $message${NC}"
    else
        echo -e "  ${RED}❌ $message${NC}"
    fi
}

check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

check_http() {
    curl -s --max-time 3 "$1" >/dev/null 2>&1
}

clear
echo -e "${PURPLE}🚀 JOBINDER DEVELOPMENT STATUS${NC}"
echo -e "${PURPLE}$(date)${NC}"

# Docker Containers
print_header "DOCKER CONTAINERS"
if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q jobinder; then
    docker ps -a --format "{{.Names}} {{.Status}}" | grep jobinder | while read name status rest; do
        if [[ "$status" == "Up"* ]]; then
            if [[ "$rest" == *"(healthy)"* ]]; then
                print_status "ok" "$name: Running (Healthy)"
            else
                print_status "warning" "$name: Running"
            fi
        else
            print_status "error" "$name: $status"
        fi
    done
else
    print_status "warning" "No Jobinder containers found"
fi

# Infrastructure Services
print_header "INFRASTRUCTURE SERVICES"
if check_port 5432; then
    if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U jobinder -d jobinder_dev >/dev/null 2>&1; then
        print_status "ok" "PostgreSQL: Ready (localhost:5432)"
    else
        print_status "warning" "PostgreSQL: Port open but not ready"
    fi
else
    print_status "error" "PostgreSQL: Not running"
fi

if check_port 6379; then
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_status "ok" "Redis: Ready (localhost:6379)"
    else
        print_status "warning" "Redis: Port open but not responding"
    fi
else
    print_status "error" "Redis: Not running"
fi

check_http "http://localhost:9200" && print_status "ok" "Elasticsearch: Ready (localhost:9200)" || print_status "error" "Elasticsearch: Not accessible"
check_http "http://localhost:9000/minio/health/live" && print_status "ok" "MinIO API: Ready (localhost:9000)" || print_status "error" "MinIO API: Not accessible"
check_http "http://localhost:9001" && print_status "ok" "MinIO Console: Ready (localhost:9001)" || print_status "error" "MinIO Console: Not accessible"
check_http "http://localhost:8081" && print_status "ok" "Adminer: Ready (localhost:8081)" || print_status "error" "Adminer: Not accessible"
check_http "http://localhost:8025" && print_status "ok" "MailHog: Ready (localhost:8025)" || print_status "error" "MailHog: Not accessible"
check_http "http://localhost:4000" && print_status "ok" "Firebase Emulator: Ready (localhost:4000)" || print_status "error" "Firebase Emulator: Not accessible"

# Application Services
print_header "APPLICATION SERVICES"
if check_port 3001; then
    if check_http "http://localhost:3001/health"; then
        print_status "ok" "User Service: Healthy (localhost:3001)"
    else
        print_status "warning" "User Service: Running but health check failed"
    fi
else
    print_status "error" "User Service: Not running"
fi

if check_port 3000; then
    if check_http "http://localhost:3000"; then
        print_status "ok" "Frontend: Ready (localhost:3000)"
    else
        print_status "warning" "Frontend: Port open but not responding"
    fi
else
    print_status "error" "Frontend: Not running"
fi

# Process Summary
print_header "PROCESS SUMMARY"
node_count=$(ps aux | grep -E "(node|npm|ts-node)" | grep -v grep | wc -l | tr -d ' ')
print_status "ok" "Node.js processes: $node_count"

# Port Summary
print_header "ACTIVE PORTS"
echo -e "${CYAN}Jobinder services:${NC}"
for port in 3000 3001 4000 5432 6379 8025 8080 8081 9000 9001 9200; do
    if check_port $port; then
        service=$(lsof -i :$port | tail -1 | awk '{print $1}')
        echo -e "  ${GREEN}✅ Port $port: $service${NC}"
    else
        echo -e "  ${YELLOW}⚪ Port $port: Available${NC}"
    fi
done

# Quick Actions
print_header "QUICK ACTIONS"
echo -e "${CYAN}Commands:${NC}"
echo -e "  ${BLUE}npm start${NC}     - Start all services"
echo -e "  ${BLUE}npm stop${NC}      - Stop all services"
echo -e "  ${BLUE}npm run dev${NC}   - Start with concurrently"
echo -e "  ${BLUE}./scripts/status.sh${NC} - This status check"

echo -e "\n${WHITE}✨ Status check completed!${NC}\n"
