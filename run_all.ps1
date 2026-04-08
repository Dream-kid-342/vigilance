# ╔══════════════════════════════════════════════════════════════╗
# ║        Vigilance — Unified Launch Script (PowerShell)        ║
# ╚══════════════════════════════════════════════════════════════╝
# Launches the single unified root app that serves both Client
# and Worker portals from one Vite dev server on port 5173.
#
# URLs after launch:
#   Landing page   → http://localhost:5173
#   Client portal  → http://localhost:5173/client
#   Worker portal  → http://localhost:5173/worker
#   Admin portal   → http://localhost:5173/admin
# ─────────────────────────────────────────────────────────────

# Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host ""

Write-Host "🚀 Launching Vigilance Unified App..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "Set-Location '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host "  ✅ Unified App → http://localhost:5173" -ForegroundColor Green
Write-Host "  ✅ Client      → http://localhost:5173/client" -ForegroundColor Blue
Write-Host "  ✅ Worker      → http://localhost:5173/worker" -ForegroundColor Green
Write-Host "  ✅ Admin       → http://localhost:5173/admin" -ForegroundColor Magenta

Write-Host "`n⏳ Waiting for server to initialise..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ Vigilance is live!" -ForegroundColor Magenta
Write-Host ""
