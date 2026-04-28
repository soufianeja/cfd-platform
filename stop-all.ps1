# ============================================================
#  CFD Platform - Stop All Services
#  Usage: .\stop-all.ps1
# ============================================================

function Ok    { param($msg) Write-Host "  $msg" -ForegroundColor Green }
function Info  { param($msg) Write-Host "  $msg" -ForegroundColor Cyan }
function Warn  { param($msg) Write-Host "  $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkRed
Write-Host "   CFD Platform - Stopping All Services    " -ForegroundColor Red
Write-Host "============================================" -ForegroundColor DarkRed
Write-Host ""

# ── Kill Laravel Backend (PHP processes on port 8000) ────────
Info "Stopping Laravel backend (Processes on port 8000)..."
$pids8000 = (netstat -ano | Select-String ":8000 ") |
    ForEach-Object { ($_ -split '\s+')[-1] } |
    Sort-Object -Unique |
    Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

if ($pids8000) {
    foreach ($p in $pids8000) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Ok "Laravel backend stopped. (PIDs: $($pids8000 -join ', '))"
} else {
    Warn "No process found on port 8000."
}

# ── Kill ML Service (Python / uvicorn) ──────────────────────
Info "Stopping ML service (Python and uvicorn processes)..."

# 1. Kill the overarching uvicorn process tree via WMI (catches the watcher process)
$uvicornProcs = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%uvicorn%'" -ErrorAction SilentlyContinue
if ($uvicornProcs) {
    foreach ($proc in $uvicornProcs) {
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

# 2. Sweep port 9001 just in case
$pids9000 = (netstat -ano | Select-String ":9001 ") |
    ForEach-Object { ($_ -split '\s+')[-1] } |
    Sort-Object -Unique |
    Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

if ($pids9000) {
    foreach ($p in $pids9000) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Ok "ML service stopped. (PIDs: $($pids9000 -join ', '))"
} elseif ($uvicornProcs) {
    Ok "ML service uvicorn processes stopped successfully."
} else {
    Warn "No process found for ML service."
}


# ── Kill Frontend (Vite / Node) ──────────────────────────────
Info "Stopping frontend (Node processes on port 5173)..."
$pids5173 = (netstat -ano | Select-String ":5173 ") |
    ForEach-Object { ($_ -split '\s+')[-1] } |
    Sort-Object -Unique |
    Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

if ($pids5173) {
    foreach ($p in $pids5173) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Ok "Frontend stopped. (PIDs: $($pids5173 -join ', '))"
} else {
    Warn "No process found on port 5173."
}

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host "   All services stopped.                   " -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""
