#!/bin/bash

# Project Deployment Script (Linux/macOS/WSL)
# ---------------------------------

echo "🚀 Starting Deployment Process..."

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example and fill in the values."
    exit 1
fi

# 2. Create necessary storage directories
echo "📁 Preparing storage directories..."
mkdir -p storage/uploads/projects

# Only run chown/chmod on Linux/macOS systems
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    echo "🔒 Setting Linux permissions..."
    sudo chown -R $USER:$USER storage 2>/dev/null || echo "⚠️ chown failed, skipping..."
    chmod -R 755 storage
fi

# 3. Build and Start Containers
echo "📦 Building and starting Docker containers..."
docker compose up -d --build

# 4. Wait for Database to be ready
echo "⏳ Waiting for database to be ready (15s)..."
sleep 15

# 5. Optional: Import Database Backup
if [ -f backup.sql ]; then
    echo "❓ Found backup.sql. Do you want to import it?"
    read -p "(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Importing database backup..."
        # Extract DB_NAME and DB_PASSWORD from .env
        DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '\r')
        DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '\r')
        
        docker compose exec -T db mariadb -u root -p"$DB_PASS" "$DB_NAME" < backup.sql
        echo "✅ Database import completed."
    fi
fi

echo "✨ Deployment Finished Successfully!"
