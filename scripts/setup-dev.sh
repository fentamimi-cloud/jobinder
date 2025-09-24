#!/bin/bash

set -e

echo "🚀 Setting up Jobinder development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
print_status "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { 
    print_error "Node.js is required but not installed. Please install Node.js 18+ and try again."
    exit 1
}

command -v npm >/dev/null 2>&1 || { 
    print_error "npm is required but not installed. Please install npm and try again."
    exit 1
}

command -v docker >/dev/null 2>&1 || { 
    print_error "Docker is required but not installed. Please install Docker and try again."
    exit 1
}

command -v docker-compose >/dev/null 2>&1 || { 
    print_error "docker-compose is required but not installed. Please install docker-compose and try again."
    exit 1
}

print_success "All prerequisites are installed!"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version $(node --version) is compatible!"

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating environment configuration file..."
    cp env.example .env.local
    print_warning "Please edit .env.local with your actual configuration values!"
    print_warning "You'll need to set up Firebase, GCP, and other API keys."
else
    print_status "Environment file already exists."
fi

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install backend service dependencies
print_status "Installing backend service dependencies..."

services=("user-service" "job-service" "notification-service")

for service in "${services[@]}"; do
    if [ -f "backend/services/$service/package.json" ]; then
        print_status "Installing dependencies for $service..."
        cd "backend/services/$service"
        npm install
        cd ../../..
        print_success "$service dependencies installed!"
    else
        print_warning "$service package.json not found, skipping..."
    fi
done

# Install shared dependencies
if [ -f "backend/shared/package.json" ]; then
    print_status "Installing shared dependencies..."
    cd backend/shared
    npm install
    cd ../..
    print_success "Shared dependencies installed!"
fi

# Start Docker services
print_status "Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 15

# Check if services are running
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U jobinder -d jobinder_dev >/dev/null 2>&1; then
    print_success "PostgreSQL is ready!"
else
    print_warning "PostgreSQL is not ready yet, you may need to wait a bit longer..."
fi

# Check Redis
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
    print_success "Redis is ready!"
else
    print_warning "Redis is not ready yet, you may need to wait a bit longer..."
fi

# Check Elasticsearch
if curl -s http://localhost:9200/_cluster/health >/dev/null 2>&1; then
    print_success "Elasticsearch is ready!"
else
    print_warning "Elasticsearch is not ready yet, it may take a few more minutes..."
fi

# Check Firebase Emulator
if curl -s http://localhost:4000 >/dev/null 2>&1; then
    print_success "Firebase Emulator is ready!"
else
    print_warning "Firebase Emulator is not ready yet, you may need to wait a bit longer..."
fi

print_success "Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your configuration values"
echo "2. Start the backend services:"
echo "   npm run dev:backend"
echo "3. In another terminal, start the frontend:"
echo "   npm run dev:frontend"
echo ""
echo "🔗 Services available at:"
echo "   Firebase Emulator UI: http://localhost:4000"
echo "   PostgreSQL: localhost:5432 (user: jobinder, db: jobinder_dev)"
echo "   Redis: localhost:6379"
echo "   Elasticsearch: http://localhost:9200"
echo "   Adminer (DB UI): http://localhost:8080"
echo "   MailHog (Email UI): http://localhost:8025"
echo "   MinIO (S3 UI): http://localhost:9001"
echo ""
echo "📚 Documentation:"
echo "   API Documentation: Will be available at http://localhost:3001/docs once services are running"
echo "   Project Documentation: ./docs/"
echo ""
print_success "Happy coding! 🎉"
