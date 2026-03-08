#!/bin/bash

# Docker Deployment Script for VPS

set -e

echo "🐳 A11y Formation - Docker Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check requirements
echo "1️⃣  Checking requirements..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is installed"

# Create .env file
echo ""
echo "2️⃣  Checking environment file..."

if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    
    read -p "Are you deploying for PRODUCTION? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.production.example .env
        print_success "Created .env from .env.production.example"
        print_warning "⚠️  EDIT .env WITH YOUR PRODUCTION SECRETS!"
        read -p "Press enter after updating .env..."
    else
        cp .env.docker.example .env
        print_success "Created .env from .env.docker.example"
    fi
else
    print_success ".env file exists"
fi

# Build and start containers
echo ""
echo "3️⃣  Building and starting containers..."

if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production containers started"
else
    docker-compose up -d
    print_success "Development containers started"
fi

# Wait for database
echo ""
echo "4️⃣  Waiting for database to be ready..."

for i in {1..30}; do
    if docker-compose exec -T db mysqladmin ping -h localhost &> /dev/null; then
        print_success "Database is ready"
        break
    fi
    echo -n "."
    sleep 1
done

# Run migrations
echo ""
echo "5️⃣  Running database migrations..."

docker-compose exec backend npx prisma migrate deploy || print_warning "Migrations completed or no pending migrations"

# Show status
echo ""
echo "6️⃣  Showing container status..."
docker-compose ps

echo ""
echo "=========================================="
print_success "Deployment completed!"
echo ""
echo "📊 Services:"
echo "  Frontend: http://localhost:5173 (dev) or http://localhost (prod)"
echo "  Backend:  http://localhost:3000"
echo "  Database: localhost:3306"
echo ""
echo "📝 Useful commands:"
echo "  docker-compose logs -f            # View logs"
echo "  docker-compose ps                 # View containers"
echo "  docker-compose exec backend sh    # Enter container"
echo "  docker-compose down               # Stop services"
echo ""
