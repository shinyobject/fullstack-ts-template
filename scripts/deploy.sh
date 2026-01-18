#!/bin/bash

# Todo App Deployment Script
# Deploys the application to M1 Mac Mini via git

set -e  # Exit on any error

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Configuration
M1_SSH_HOST="${M1_SSH_HOST:-user@m1-mac-mini.local}"
M1_DEPLOY_PATH="${M1_DEPLOY_PATH:-/Users/\$(whoami)/todo-app}"
M1_GIT_REPO="${M1_GIT_REPO:-/Users/\$(whoami)/todo-app.git}"
BRANCH="${DEPLOY_BRANCH:-main}"

echo "======================================"
echo "Todo App Deployment"
echo "======================================"
echo "Target: $M1_SSH_HOST"
echo "Deploy Path: $M1_DEPLOY_PATH"
echo "Branch: $BRANCH"
echo ""

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Warning: You have uncommitted changes!"
  git status -s
  read -p "Continue with deployment? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
  fi
fi

# Backup database on M1
echo "📦 Backing up database on M1..."
./scripts/backup-db.sh || {
  echo "⚠️  Database backup failed, but continuing..."
}

# Push to M1 git repository
echo "🚀 Pushing code to M1..."
git push m1-production $BRANCH || {
  echo "❌ Git push failed. Make sure you've set up the git remote:"
  echo "   git remote add m1-production ssh://$M1_SSH_HOST$M1_GIT_REPO"
  exit 1
}

# Deploy on M1
echo "📤 Deploying on M1..."
ssh "$M1_SSH_HOST" "bash -s" << EOF
  set -e

  echo "📂 Navigating to deployment directory..."
  cd $M1_DEPLOY_PATH

  echo "⬇️  Pulling latest changes..."
  git pull origin $BRANCH

  echo "📦 Installing server dependencies..."
  cd server
  npm ci --production=false

  echo "🔨 Building server..."
  npm run build

  echo "📦 Installing client dependencies..."
  cd ../client
  npm ci --production=false

  echo "🔨 Building client..."
  npm run build

  echo "📋 Copying client build to server public directory..."
  mkdir -p ../server/public
  rm -rf ../server/public/*
  cp -r dist/* ../server/public/

  echo "🔄 Restarting PM2 app..."
  cd ..
  pm2 restart todo-app || pm2 start ecosystem.config.js --only todo-app

  echo "✅ Deployment complete!"
EOF

# Health check
echo "🏥 Running health check..."
sleep 5
./scripts/health-check.sh

if [ $? -eq 0 ]; then
  echo ""
  echo "======================================"
  echo "✅ Deployment successful!"
  echo "======================================"
  echo ""
  echo "Check app status: ssh $M1_SSH_HOST 'pm2 status'"
  echo "View logs: ssh $M1_SSH_HOST 'pm2 logs todo-app'"
else
  echo ""
  echo "======================================"
  echo "❌ Health check failed!"
  echo "======================================"
  echo ""
  echo "Check logs: ssh $M1_SSH_HOST 'pm2 logs todo-app'"
  exit 1
fi
