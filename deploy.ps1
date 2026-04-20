# Project Deployment Script (Windows PowerShell) - Ultra Stable Version
# ---------------------------------------------------------

Write-Host "Starting Deployment Process..." -ForegroundColor Cyan

# Function to get value from .env file
function Get-EnvValue($key) {
    if (Test-Path ".env") {
        $content = Get-Content ".env"
        foreach ($line in $content) {
            if ($line -match "^$key=(.*)") {
                return $matches[1].Trim()
            }
        }
    }
    return $null
}

# 1. Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example and fill in the values."
    exit
}

# 2. Create necessary storage directories
Write-Host "Preparing storage directories..." -ForegroundColor Yellow
if (-not (Test-Path "storage/uploads/projects")) {
    New-Item -ItemType Directory -Force -Path "storage/uploads/projects" | Out-Null
}

# 3. Build and Start Containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Yellow
docker compose up -d --build

# 4. Wait for Database to be ready
Write-Host "Waiting for database to be ready (15s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 5. Optional: Import Database Backup
if (Test-Path "backup.sql") {
    Write-Host "Found backup.sql. Do you want to import the database backup?" -ForegroundColor White
    Write-Host "Press Y for Yes, any other key to skip: " -NoNewline
    $keyInput = [Console]::ReadKey($true)
    Write-Host ""

    if ($keyInput.Key -eq 'Y') {
        Write-Host "Importing database backup..." -ForegroundColor Yellow
        
        $dbName = Get-EnvValue "DB_NAME"
        $dbPass = Get-EnvValue "DB_PASSWORD"

        if ($dbName -and $dbPass) {
            # Use cmd /c to handle piping into docker correctly on Windows
            cmd /c "type backup.sql | docker compose exec -T db mariadb -u root -p$dbPass $dbName"
            Write-Host "Database import completed." -ForegroundColor Green
        } else {
            Write-Host "Could not find DB_NAME or DB_PASSWORD in .env" -ForegroundColor Red
        }
    }
}

$port = Get-EnvValue "PORT"
if (-not $port) { $port = "3000" }

Write-Host ""
Write-Host "Deployment Finished Successfully!" -ForegroundColor Green
Write-Host ("App is running at: http://localhost:" + $port)
