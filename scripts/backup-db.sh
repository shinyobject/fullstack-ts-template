#!/bin/bash

# Database Backup Script
# Backs up the SQLite database on M1 Mac Mini

set -e  # Exit on any error

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Configuration
M1_SSH_HOST="${M1_SSH_HOST:-user@m1-mac-mini.local}"
M1_DEPLOY_PATH="${M1_DEPLOY_PATH:-/Users/\$(whoami)/todo-app}"
BACKUP_DIR="${M1_BACKUP_DIR:-/Users/\$(whoami)/todo-app-backups}"
DB_PATH="${DB_PATH:-server/database/todos.db}"
MAX_BACKUPS="${MAX_BACKUPS:-10}"

echo "💾 Backing up database on M1..."

# Create backup on M1
ssh "$M1_SSH_HOST" "bash -s" << EOF
  set -e

  # Create backup directory if it doesn't exist
  mkdir -p $BACKUP_DIR

  # Generate timestamp
  TIMESTAMP=\$(date +%Y-%m-%d-%H-%M-%S)
  BACKUP_FILE="$BACKUP_DIR/todos-backup-\$TIMESTAMP.db"

  # Check if database exists
  if [ -f "$M1_DEPLOY_PATH/$DB_PATH" ]; then
    # Copy database file
    cp "$M1_DEPLOY_PATH/$DB_PATH" "\$BACKUP_FILE"
    echo "✅ Database backed up to: \$BACKUP_FILE"

    # Get backup size
    SIZE=\$(du -h "\$BACKUP_FILE" | cut -f1)
    echo "   Size: \$SIZE"

    # Clean up old backups (keep last $MAX_BACKUPS)
    cd $BACKUP_DIR
    BACKUP_COUNT=\$(ls -1 todos-backup-*.db 2>/dev/null | wc -l)

    if [ \$BACKUP_COUNT -gt $MAX_BACKUPS ]; then
      echo "🧹 Cleaning up old backups (keeping last $MAX_BACKUPS)..."
      ls -1t todos-backup-*.db | tail -n +\$((MAX_BACKUPS + 1)) | xargs rm -f
      echo "   Removed \$((BACKUP_COUNT - MAX_BACKUPS)) old backup(s)"
    fi
  else
    echo "⚠️  Database file not found: $M1_DEPLOY_PATH/$DB_PATH"
    echo "   This might be the first deployment."
    exit 0
  fi
EOF

echo "✅ Backup complete!"
