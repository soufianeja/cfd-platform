# ============================================================
#  CFD Platform - Start All Services
#  Usage: .\start-all.ps1
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition

# --- Colors ---
function Info  { param($msg) Write-Host "  $msg" -ForegroundColor Cyan }
function Ok    { param($msg) Write-Host "  $msg" -ForegroundColor Green }
function Warn  { param($msg) Write-Host "  $msg" -ForegroundColor Yellow }
function Error { param($msg) Write-Host "  $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "   CFD Platform - Starting All Services    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""

# ── 1. XAMPP MySQL ──────────────────────────────────────────
Info "Checking MySQL (XAMPP)..."
$mysqlRunning = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($mysqlRunning) {
    Ok "MySQL is already running."
} else {
    Warn "MySQL not running. Starting XAMPP MySQL..."
    $xamppPath = "C:\xampp\xampp-control.exe"
    if (Test-Path $xamppPath) {
        Start-Process $xamppPath
        Warn "XAMPP Control Panel opened. Please start MySQL manually if needed."
        Start-Sleep -Seconds 3
    } else {
        $mysqlBin = "C:\xampp\mysql\bin\mysqld.exe"
        if (Test-Path $mysqlBin) {
            Start-Process $mysqlBin -WindowStyle Hidden
            Start-Sleep -Seconds 3
            Ok "MySQL started."
        } else {
            Error "XAMPP not found at C:\xampp. Please start MySQL manually."
        }
    }
}

Write-Host ""

# ── 2. Laravel Backend (port 8000) ──────────────────────────
Info "Starting Laravel backend on http://localhost:8000 ..."
$backendPath = Join-Path $ROOT "backend"
$backendJob = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; php artisan serve --host=127.0.0.1 --port=8000" `
    -PassThru
Ok "Laravel backend started. (PID: $($backendJob.Id))"

Write-Host ""

# ── 3. ML Service / FastAPI (port 9000) ─────────────────────
Info "Starting ML service on http://localhost:9000 ..."
$mlPath = Join-Path $ROOT "ml-service"

# Detect python command (prefer virtual environment)
$venvPython = Join-Path $mlPath "venv\Scripts\python.exe"
$pythonCmd = $null

if (Test-Path $venvPython) {
    $pythonCmd = $venvPython
} else {
    foreach ($cmd in @("python3.13", "python3", "python")) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            $pythonCmd = $cmd
            break
        }
    }
}

if ($null -eq $pythonCmd) {
    Error "Python not found in PATH. Please add Python to your PATH and retry."
} else {
    $mlJob = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$mlPath'; $pythonCmd -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload" `
        -PassThru
    Ok "ML service started. (PID: $($mlJob.Id))"
}

Write-Host ""

# ── 4. Frontend / Vite (port 5173) ──────────────────────────
Info "Starting frontend on http://localhost:5173 ..."
$frontendPath = Join-Path $ROOT "frontend"
$frontendJob = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev" `
    -PassThru
Ok "Frontend started. (PID: $($frontendJob.Id))"

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "   All services launched!                  " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "   Frontend   -> http://localhost:5173" -ForegroundColor White
Write-Host "   Backend    -> http://localhost:8000" -ForegroundColor White
Write-Host "   ML Service -> http://localhost:9000" -ForegroundColor White
Write-Host "   ML Docs    -> http://localhost:9000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Run .\stop-all.ps1 to stop everything." -ForegroundColor DarkGray
Write-Host ""
