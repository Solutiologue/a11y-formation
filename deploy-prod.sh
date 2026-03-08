#!/bin/bash

# Production Deployment Script for Ionos VPS

set -e

echo "🚀 A11y Formation - Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Backup current database
echo "1️⃣  Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/pre_deploy_${TIMESTAMP}.sql"
mkdir -p backups

if docker-compose exec -T db mysqldump -uroot -p${DB_ROOT_PASSWORD} ${DB_NAME} > $BACKUP_FILE 2>/dev/null; then
    print_success "Backup created: $BACKUP_FILE"
else
    print_warning "Could not create backup (database may not be running yet)"
fi

# Pull latest changes
echo ""
echo "2️⃣  Pulling latest changes..."
if git pull origin main; then
    print_success "Code updated"
else
    print_warning "Could not pull changes"
fi

# Build images
echo ""
echo "3️⃣  Building Docker images..."
docker compose -f docker-compose.prod.yml build
print_success "Images built"

# Stop old containers
echo ""
echo "4️⃣  Stopping old containers..."
docker compose -f docker-compose.prod.yml down
print_success "Old containers stopped"

# Start new containers
echo ""
echo "5️⃣  Starting new containers..."
docker compose -f docker-compose.prod.yml up -d
print_success "New containers started"

# Wait for database
echo ""
echo "6️⃣  Waiting for database..."
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
echo "7️⃣  Running migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
print_success "Migrations completed"

# Show status
echo ""
echo "8️⃣  Checking status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
print_success "Deployment completed!"
echo ""

# Show rollback command
echo "📝 To rollback, restore the backup:"
echo "  docker-compose exec -T db mysql -uroot -p\${DB_ROOT_PASSWORD} \${DB_NAME} < $BACKUP_FILE"
echo ""
