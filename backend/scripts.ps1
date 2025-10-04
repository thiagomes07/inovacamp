# ====================================
# INOVACAMP - Backend Scripts Helper
# ====================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "InovaCamp Backend Helper Scripts" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to start all services
function Start-Services {
    Write-Host "[+] Starting all services..." -ForegroundColor Green
    docker-compose up -d
    Write-Host "[✓] Services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the API:" -ForegroundColor Yellow
    Write-Host "  - API: http://localhost" -ForegroundColor White
    Write-Host "  - Docs: http://localhost/docs" -ForegroundColor White
    Write-Host "  - Health: http://localhost/health" -ForegroundColor White
}

# Function to stop all services
function Stop-Services {
    Write-Host "[+] Stopping all services..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "[✓] Services stopped!" -ForegroundColor Green
}

# Function to restart services
function Restart-Services {
    Write-Host "[+] Restarting services..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "[✓] Services restarted!" -ForegroundColor Green
}

# Function to view logs
function Show-Logs {
    param([string]$Service = "")
    
    if ($Service -eq "") {
        Write-Host "[+] Showing all logs..." -ForegroundColor Blue
        docker-compose logs -f
    } else {
        Write-Host "[+] Showing logs for $Service..." -ForegroundColor Blue
        docker-compose logs -f $Service
    }
}

# Function to rebuild services
function Rebuild-Services {
    Write-Host "[+] Rebuilding services..." -ForegroundColor Yellow
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "[✓] Services rebuilt and started!" -ForegroundColor Green
}

# Function to reset database
function Reset-Database {
    Write-Host "[!] WARNING: This will delete all data!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? (yes/no)"
    
    if ($confirmation -eq "yes") {
        Write-Host "[+] Resetting database..." -ForegroundColor Yellow
        docker-compose down -v
        docker-compose up -d db
        Start-Sleep -Seconds 10
        docker-compose up -d backend
        Write-Host "[✓] Database reset complete!" -ForegroundColor Green
    } else {
        Write-Host "[!] Operation cancelled" -ForegroundColor Yellow
    }
}

# Function to enter container shell
function Enter-Container {
    param([string]$Service = "backend")
    
    Write-Host "[+] Entering $Service container..." -ForegroundColor Blue
    docker exec -it "inovacamp_$Service" bash
}

# Function to check status
function Check-Status {
    Write-Host "[+] Checking services status..." -ForegroundColor Blue
    Write-Host ""
    docker-compose ps
    Write-Host ""
    
    # Test API health
    try {
        $response = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -ErrorAction Stop
        Write-Host "[✓] API is healthy: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "[✗] API is not responding" -ForegroundColor Red
    }
}

# Menu
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  1. Start services" -ForegroundColor White
Write-Host "  2. Stop services" -ForegroundColor White
Write-Host "  3. Restart services" -ForegroundColor White
Write-Host "  4. Show logs (all)" -ForegroundColor White
Write-Host "  5. Show logs (backend)" -ForegroundColor White
Write-Host "  6. Show logs (db)" -ForegroundColor White
Write-Host "  7. Show logs (nginx)" -ForegroundColor White
Write-Host "  8. Rebuild services" -ForegroundColor White
Write-Host "  9. Reset database" -ForegroundColor White
Write-Host " 10. Enter backend container" -ForegroundColor White
Write-Host " 11. Enter db container" -ForegroundColor White
Write-Host " 12. Check status" -ForegroundColor White
Write-Host "  0. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose an option"

switch ($choice) {
    "1" { Start-Services }
    "2" { Stop-Services }
    "3" { Restart-Services }
    "4" { Show-Logs }
    "5" { Show-Logs -Service "backend" }
    "6" { Show-Logs -Service "db" }
    "7" { Show-Logs -Service "nginx" }
    "8" { Rebuild-Services }
    "9" { Reset-Database }
    "10" { Enter-Container -Service "backend" }
    "11" { Enter-Container -Service "db" }
    "12" { Check-Status }
    "0" { Write-Host "Goodbye!" -ForegroundColor Cyan; exit }
    default { Write-Host "[✗] Invalid option" -ForegroundColor Red }
}
