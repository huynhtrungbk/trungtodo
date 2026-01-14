#!/bin/bash
# ============================================================
# 🚀 DEPLOY.SH - Todo App Deployment Script with Backup & Rollback
# ============================================================
# Version: 2.0
# Location: /var/www/todo-app/deploy.sh (on VPS)
# 
# Features:
# - Automatic database backup before deployment
# - Git-based code rollback
# - Docker image versioning
# - Health check after deployment
# - Automatic rollback on failure
# ============================================================

set -e  # Exit on any error

# ============================================================
# 📋 CONFIGURATION
# ============================================================
APP_DIR="/var/www/todo-app"
BACKUP_DIR="/var/backups/todo-app"
LOG_FILE="/var/log/todo-app-deploy.log"
DOCKER_IMAGE="todo-app-todo-app"
CONTAINER_NAME="todo-app"
DB_NAME="todo_db"
DB_USER="admin"
HEALTH_CHECK_URL="http://localhost:3000/api/todos?status=active"
MAX_HEALTH_RETRIES=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# 📝 HELPER FUNCTIONS
# ============================================================

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# ============================================================
# 1️⃣ PRE-DEPLOYMENT BACKUP
# ============================================================
backup_database() {
    log "📦 Creating database backup..."
    
    # Create backup directory if not exists
    mkdir -p "$BACKUP_DIR/db"
    
    # Generate backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/db/${DB_NAME}_$(date '+%Y%m%d_%H%M%S').sql"
    
    # Perform backup
    su - postgres -c "pg_dump $DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log "✅ Database backed up to: $BACKUP_FILE"
        # Compress backup
        gzip "$BACKUP_FILE"
        log "✅ Backup compressed: ${BACKUP_FILE}.gz"
        
        # Keep only last 7 backups
        ls -t "$BACKUP_DIR/db/"*.gz 2>/dev/null | tail -n +8 | xargs -r rm
        log "🧹 Old backups cleaned (keeping last 7)"
    else
        error "Database backup failed!"
        exit 1
    fi
}

backup_code() {
    log "📦 Saving current git commit for rollback..."
    
    cd "$APP_DIR"
    PREVIOUS_COMMIT=$(git rev-parse HEAD)
    echo "$PREVIOUS_COMMIT" > "$BACKUP_DIR/last_good_commit.txt"
    log "✅ Saved commit: $PREVIOUS_COMMIT"
}

backup_docker_image() {
    log "📦 Tagging current Docker image for rollback..."
    
    # Check if current image exists
    if docker images | grep -q "$DOCKER_IMAGE"; then
        docker tag "$DOCKER_IMAGE:latest" "$DOCKER_IMAGE:backup-$(date '+%Y%m%d_%H%M%S')"
        log "✅ Docker image tagged for backup"
        
        # Keep only last 3 backup images
        docker images "$DOCKER_IMAGE" --format "{{.Tag}}" | grep "^backup-" | tail -n +4 | xargs -r -I {} docker rmi "$DOCKER_IMAGE:{}"
    else
        warn "No existing Docker image to backup"
    fi
}

# ============================================================
# 2️⃣ DEPLOYMENT
# ============================================================
pull_code() {
    log "📥 Pulling latest code from GitHub..."
    
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
    
    NEW_COMMIT=$(git rev-parse HEAD)
    log "✅ Updated to commit: $NEW_COMMIT"
}

build_docker() {
    log "🏗️  Building Docker image..."
    
    cd "$APP_DIR"
    docker compose build --no-cache
    
    if [ $? -eq 0 ]; then
        log "✅ Docker image built successfully"
    else
        error "Docker build failed!"
        return 1
    fi
}

run_migrations() {
    log "📦 Running database migrations..."
    
    cd "$APP_DIR"
    
    # Run prisma db push inside a temporary container
    docker run --rm --network host \
        -e DATABASE_URL="postgresql://${DB_USER}:admin123@127.0.0.1:5432/${DB_NAME}" \
        "$DOCKER_IMAGE" \
        npx prisma db push --accept-data-loss
    
    if [ $? -eq 0 ]; then
        log "✅ Database migrations completed"
    else
        error "Database migration failed!"
        return 1
    fi
}

restart_container() {
    log "🔄 Restarting application container..."
    
    # Stop and remove old container
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    
    # Start new container
    cd "$APP_DIR"
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        log "✅ Container started"
    else
        error "Container start failed!"
        return 1
    fi
}

# ============================================================
# 3️⃣ HEALTH CHECK
# ============================================================
health_check() {
    log "🏥 Running health check..."
    
    # Wait for container to be ready
    sleep 5
    
    for i in $(seq 1 $MAX_HEALTH_RETRIES); do
        log "Health check attempt $i/$MAX_HEALTH_RETRIES..."
        
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            log "✅ Health check passed! (HTTP $HTTP_CODE)"
            return 0
        fi
        
        warn "Health check failed (HTTP $HTTP_CODE), retrying in 3s..."
        sleep 3
    done
    
    error "Health check failed after $MAX_HEALTH_RETRIES attempts!"
    return 1
}

# ============================================================
# 4️⃣ ROLLBACK
# ============================================================
rollback_code() {
    log "🔙 Rolling back code..."
    
    if [ -f "$BACKUP_DIR/last_good_commit.txt" ]; then
        ROLLBACK_COMMIT=$(cat "$BACKUP_DIR/last_good_commit.txt")
        cd "$APP_DIR"
        git checkout "$ROLLBACK_COMMIT"
        log "✅ Code rolled back to: $ROLLBACK_COMMIT"
    else
        error "No rollback commit found!"
        return 1
    fi
}

rollback_database() {
    log "🔙 Rolling back database..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR/db/"*.gz 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring from: $LATEST_BACKUP"
        
        # Decompress and restore
        gunzip -c "$LATEST_BACKUP" | su - postgres -c "psql $DB_NAME"
        
        if [ $? -eq 0 ]; then
            log "✅ Database restored successfully"
        else
            error "Database restore failed!"
            return 1
        fi
    else
        error "No database backup found!"
        return 1
    fi
}

rollback_docker() {
    log "🔙 Rolling back Docker image..."
    
    # Find latest backup image
    BACKUP_TAG=$(docker images "$DOCKER_IMAGE" --format "{{.Tag}}" | grep "^backup-" | head -1)
    
    if [ -n "$BACKUP_TAG" ]; then
        docker tag "$DOCKER_IMAGE:$BACKUP_TAG" "$DOCKER_IMAGE:latest"
        log "✅ Docker image rolled back to: $BACKUP_TAG"
    else
        warn "No backup Docker image found, rebuilding..."
        build_docker
    fi
}

full_rollback() {
    error "🚨 DEPLOYMENT FAILED! Initiating full rollback..."
    
    rollback_code
    rollback_docker
    restart_container
    
    warn "⚠️ Note: Database was NOT rolled back automatically for safety."
    warn "If database rollback is needed, run: $0 --rollback-db"
    
    log "🔙 Rollback completed. Please investigate the issue."
    exit 1
}

# ============================================================
# 🎯 MAIN EXECUTION
# ============================================================
main() {
    log "=============================================="
    log "🚀 Starting deployment at $(date)"
    log "=============================================="
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        error "Please run as root"
        exit 1
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Step 1: Backup everything
    log "📦 PHASE 1: BACKUP"
    backup_database
    backup_code
    backup_docker_image
    
    # Step 2: Deploy
    log "🚀 PHASE 2: DEPLOY"
    pull_code || full_rollback
    build_docker || full_rollback
    run_migrations || full_rollback
    restart_container || full_rollback
    
    # Step 3: Verify
    log "✅ PHASE 3: VERIFY"
    if ! health_check; then
        full_rollback
    fi
    
    log "=============================================="
    log "🎉 DEPLOYMENT SUCCESSFUL!"
    log "=============================================="
    log "Backup location: $BACKUP_DIR"
    log "Log file: $LOG_FILE"
    log ""
    log "To rollback manually:"
    log "  Code: git checkout \$(cat $BACKUP_DIR/last_good_commit.txt)"
    log "  DB: $0 --rollback-db"
    log "=============================================="
}

# Handle command line arguments
case "${1:-}" in
    --rollback-db)
        rollback_database
        ;;
    --rollback-full)
        full_rollback
        ;;
    --backup-only)
        backup_database
        backup_code
        log "Backup completed (no deployment)"
        ;;
    *)
        main
        ;;
esac
