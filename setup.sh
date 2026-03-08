#!/bin/bash

# Quick Setup Script for A11y Formation Monorepo

echo "🚀 Setting up A11y Formation Monorepo..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
echo "🔧 Setting up environment files..."
cp packages/frontend/.env.example packages/frontend/.env.local 2>/dev/null || true
cp packages/backend/.env.example packages/backend/.env.local 2>/dev/null || true
cp packages/database/.env.example packages/database/.env.local 2>/dev/null || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your MySQL database connection in packages/database/.env.local"
echo "2. Run migrations: npm run db:migrate --workspace=packages/database"
echo "3. Seed the database: npm run db:seed --workspace=packages/database"
echo "4. Start development: npm run dev"
echo ""
echo "📚 For more info, see README.md"
