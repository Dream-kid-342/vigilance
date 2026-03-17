# Vigilance Multi-App Launch Script

# Kill existing node processes to free up ports
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "🚀 Launching Vigilance Ecosystem (Universal Approach)..." -ForegroundColor Cyan

# Start Unified User App (Client)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'client'; npm install; npm run dev" -WindowStyle Normal
Write-Host "✅ Client App starting on http://localhost:5173" -ForegroundColor Green

# Start Worker App
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'worker'; npm install; npm run dev" -WindowStyle Normal
Write-Host "✅ Worker App starting on http://localhost:5174" -ForegroundColor Green

# Start Admin App
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'admin'; npm install; npm run dev" -WindowStyle Normal
Write-Host "✅ Admin App starting on http://localhost:5175" -ForegroundColor Green

Write-Host "`n⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

# Open portals in the browser
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"
Start-Process "http://localhost:5175"

Write-Host "✨ All systems online!" -ForegroundColor Magenta
