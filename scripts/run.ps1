<#
  Aroha Retreat - local dev automation
  Usage (from anywhere, run in PowerShell):
    .\scripts\run.ps1 install   # npm install (one-time / after pulling changes)
    .\scripts\run.ps1 start     # start frontend (Vite) + backend (Python API), open browser
    .\scripts\run.ps1 stop      # stop both
    .\scripts\run.ps1 status    # show whether they're running
    .\scripts\run.ps1 restart   # stop then start
#>

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("install", "start", "stop", "status", "restart")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

$Root    = Split-Path -Parent $PSScriptRoot
$RunDir  = Join-Path $Root ".run"
$FePid   = Join-Path $RunDir "frontend.pid"
$BePid   = Join-Path $RunDir "backend.pid"
$FeLog   = Join-Path $RunDir "frontend.log"
$BeLog   = Join-Path $RunDir "backend.log"
$FeUrl   = "http://localhost:5173"

function Ensure-RunDir {
    if (-not (Test-Path $RunDir)) { New-Item -ItemType Directory -Path $RunDir | Out-Null }
}

function Get-RunningPid($pidFile) {
    if (Test-Path $pidFile) {
        $procId = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($procId -and (Get-Process -Id $procId -ErrorAction SilentlyContinue)) {
            return [int]$procId
        }
    }
    return $null
}

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

switch ($Action) {

    "install" {
        if (-not (Test-Command "npm"))    { throw "npm not found. Install Node.js from https://nodejs.org first." }
        if (-not (Test-Command "python")) { throw "python not found. Install Python 3 from https://python.org first." }
        Write-Host "Installing frontend dependencies (npm install)..." -ForegroundColor Cyan
        Push-Location $Root
        try { npm install } finally { Pop-Location }
        Write-Host "Done. Backend uses only Python's standard library - nothing else to install." -ForegroundColor Green
    }

    "start" {
        Ensure-RunDir
        if (-not (Test-Path (Join-Path $Root "node_modules"))) {
            Write-Host "node_modules not found - running install first..." -ForegroundColor Yellow
            & $PSCommandPath install
        }

        $feRunning = Get-RunningPid $FePid
        $beRunning = Get-RunningPid $BePid

        if ($beRunning) {
            Write-Host "Backend already running (PID $beRunning)." -ForegroundColor Yellow
        } else {
            Write-Host "Starting backend (python server/app.py on :8088)..." -ForegroundColor Cyan
            $be = Start-Process -FilePath "python" `
                -ArgumentList "server/app.py" `
                -WorkingDirectory $Root `
                -WindowStyle Hidden `
                -RedirectStandardOutput $BeLog `
                -RedirectStandardError "$BeLog.err" `
                -PassThru
            $be.Id | Out-File -FilePath $BePid -Encoding ascii
            Write-Host "Backend started (PID $($be.Id)). Logs: $BeLog" -ForegroundColor Green
        }

        if ($feRunning) {
            Write-Host "Frontend already running (PID $feRunning)." -ForegroundColor Yellow
        } else {
            Write-Host "Starting frontend (npm run dev on :5173)..." -ForegroundColor Cyan
            $fe = Start-Process -FilePath "npm.cmd" `
                -ArgumentList "run", "dev" `
                -WorkingDirectory $Root `
                -WindowStyle Hidden `
                -RedirectStandardOutput $FeLog `
                -RedirectStandardError "$FeLog.err" `
                -PassThru
            $fe.Id | Out-File -FilePath $FePid -Encoding ascii
            Write-Host "Frontend started (PID $($fe.Id)). Logs: $FeLog" -ForegroundColor Green
        }

        Start-Sleep -Seconds 2
        Write-Host "Opening $FeUrl ..." -ForegroundColor Cyan
        Start-Process $FeUrl
    }

    "stop" {
        foreach ($item in @(
            @{ Name = "Frontend"; PidFile = $FePid },
            @{ Name = "Backend";  PidFile = $BePid }
        )) {
            $p = Get-RunningPid $item.PidFile
            if ($p) {
                Write-Host "Stopping $($item.Name) (PID $p)..." -ForegroundColor Cyan
                # npm.cmd spawns a child node process - stop the whole tree.
                Get-CimInstance Win32_Process -Filter "ParentProcessId=$p" -ErrorAction SilentlyContinue |
                    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                Remove-Item $item.PidFile -ErrorAction SilentlyContinue
                Write-Host "$($item.Name) stopped." -ForegroundColor Green
            } else {
                Write-Host "$($item.Name) is not running." -ForegroundColor Yellow
            }
        }
    }

    "status" {
        $fe = Get-RunningPid $FePid
        $be = Get-RunningPid $BePid
        Write-Host ("Frontend (Vite, :5173): " + $(if ($fe) { "RUNNING (PID $fe)" } else { "stopped" }))
        Write-Host ("Backend  (API,  :8088): " + $(if ($be) { "RUNNING (PID $be)" } else { "stopped" }))
    }

    "restart" {
        & $PSCommandPath stop
        Start-Sleep -Seconds 1
        & $PSCommandPath start
    }
}
