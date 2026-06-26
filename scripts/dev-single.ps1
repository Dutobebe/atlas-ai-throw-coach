# Starts exactly one Next.js dev server for Project Atlas.
# Kills stale next dev processes tied to this project, parses Local URL from stdout,
# verifies HTTP 200, and opens the URL in the default browser.

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$NormalizedRoot = $ProjectRoot.ToLowerInvariant().Replace('/', '\')
$LocalUrlPattern = [regex]'Local:\s+(https?://[^\s]+)'
$MaxStartupSeconds = 120

function Write-Info([string]$Message) {
    Write-Host $Message
}

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Normalize-PathForMatch([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }
    return $Path.ToLowerInvariant().Replace('/', '\')
}

function Test-IsProjectNextDev([string]$CommandLine) {
    if ([string]::IsNullOrWhiteSpace($CommandLine)) {
        return $false
    }

    $normalized = $CommandLine.ToLowerInvariant()
    $hasNextDev = $normalized -match 'next(\.cmd|\.exe)?(\s|\\)+dev' -or $normalized -match 'next\\dist\\bin\\next(\.js)?(\s|\\)+dev'
    if (-not $hasNextDev) {
        return $false
    }

    $normalizedCmd = Normalize-PathForMatch $CommandLine
    return $normalizedCmd.Contains($NormalizedRoot)
}

function Get-ProjectNextDevProcesses {
    $matches = @()

    $nodeProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
    foreach ($proc in $nodeProcesses) {
        if (Test-IsProjectNextDev $proc.CommandLine) {
            $matches += [PSCustomObject]@{
                PID = $proc.ProcessId
                CommandLine = $proc.CommandLine
                Source = "command-line"
            }
        }
    }

    return $matches
}

function Get-PortOwnerPid([int]$Port) {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        if ($conn.OwningProcess -gt 0) {
            return $conn.OwningProcess
        }
    }
    return $null
}

function Test-PortOwnedByProjectNextDev([int]$Port) {
    $ownerPid = Get-PortOwnerPid -Port $Port
    if (-not $ownerPid) {
        return $null
    }

    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerPid" -ErrorAction SilentlyContinue
    if (-not $proc) {
        return $null
    }

    if (Test-IsProjectNextDev $proc.CommandLine) {
        return [PSCustomObject]@{
            PID = $ownerPid
            CommandLine = $proc.CommandLine
            Source = "port-$Port"
        }
    }

    return $null
}

function Stop-StaleNextDevServers {
    $killed = @()
    $seenPids = @{}

    $candidates = Get-ProjectNextDevProcesses
    for ($port = 3000; $port -le 3010; $port++) {
        $portMatch = Test-PortOwnedByProjectNextDev -Port $port
        if ($portMatch) {
            $candidates += $portMatch
        }
    }

    foreach ($candidate in $candidates) {
        if ($seenPids.ContainsKey($candidate.PID)) {
            continue
        }
        $seenPids[$candidate.PID] = $true

        Write-Info "Stopping stale Next.js dev server (PID $($candidate.PID), $($candidate.Source))"
        Stop-Process -Id $candidate.PID -Force -ErrorAction SilentlyContinue
        $killed += [PSCustomObject]@{
            PID = $candidate.PID
            Source = $candidate.Source
            CommandLine = $candidate.CommandLine
        }
    }

    if ($killed.Count -gt 0) {
        Start-Sleep -Seconds 2
    }

    return $killed
}

function Read-NewLogBytes([string]$Path, [ref]$Offset) {
    if (-not (Test-Path $Path)) {
        return ""
    }

    $fs = [System.IO.FileStream]::new(
        $Path,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite
    )

    try {
        if ($Offset.Value -gt $fs.Length) {
            $Offset.Value = 0
        }

        $fs.Seek($Offset.Value, [System.IO.SeekOrigin]::Begin) | Out-Null
        $reader = New-Object System.IO.StreamReader($fs)
        $content = $reader.ReadToEnd()
        $Offset.Value = $fs.Position
        return $content
    }
    finally {
        $fs.Dispose()
    }
}

function Wait-ForLocalUrl([System.Diagnostics.Process]$Process, [string[]]$LogPaths, [System.Text.StringBuilder]$OutputBuffer) {
    $deadline = (Get-Date).AddSeconds($MaxStartupSeconds)
    $offsets = @{}
    foreach ($logPath in $LogPaths) {
        $offsets[$logPath] = 0
    }

    while ((Get-Date) -lt $deadline) {
        if ($Process.HasExited) {
            foreach ($logPath in $LogPaths) {
                $ref = [ref]$offsets[$logPath]
                $chunk = Read-NewLogBytes -Path $logPath -Offset $ref
                if ($chunk) {
                    foreach ($line in ($chunk -split "`r?`n")) {
                        if ($line) {
                            Write-Host $line
                            [void]$OutputBuffer.AppendLine($line)
                        }
                    }
                }
            }
            throw "Dev server exited before reporting Local URL.`n$OutputBuffer"
        }

        foreach ($logPath in $LogPaths) {
            $ref = [ref]$offsets[$logPath]
            $chunk = Read-NewLogBytes -Path $logPath -Offset $ref
            if (-not $chunk) {
                continue
            }

            foreach ($line in ($chunk -split "`r?`n")) {
                if (-not $line) {
                    continue
                }
                Write-Host $line
                [void]$OutputBuffer.AppendLine($line)
            }
        }

        $match = $LocalUrlPattern.Match($OutputBuffer.ToString())
        if ($match.Success) {
            return $match.Groups[1].Value.Trim()
        }

        Start-Sleep -Milliseconds 200
    }

    throw "Timed out after ${MaxStartupSeconds}s waiting for Next.js Local URL.`n$OutputBuffer"
}

function Test-HttpOk([string]$Url) {
    $attempts = 0
    $maxAttempts = 30

    while ($attempts -lt $maxAttempts) {
        $attempts++
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            return [PSCustomObject]@{
                Ok = ($response.StatusCode -eq 200)
                StatusCode = $response.StatusCode
            }
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }

    throw "Failed to verify HTTP 200 at $Url after $maxAttempts attempts."
}

function Start-DevServer {
    $nextScript = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"
    if (-not (Test-Path $nextScript)) {
        throw "Next.js CLI not found at $nextScript. Run npm install first."
    }

    $nodeCmd = Get-Command node -ErrorAction Stop
    $logDir = Join-Path $env:TEMP "project-atlas-dev-single"
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null

    $runId = [guid]::NewGuid().ToString("N")
    $stdoutLog = Join-Path $logDir "stdout-$runId.log"
    $stderrLog = Join-Path $logDir "stderr-$runId.log"

    $process = Start-Process `
        -FilePath $nodeCmd.Source `
        -ArgumentList "`"$nextScript`" dev --turbopack" `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru `
        -WindowStyle Hidden

    if (-not $process) {
        throw "Failed to start next dev --turbopack."
    }

    return [PSCustomObject]@{
        Process = $process
        OutputBuffer = New-Object System.Text.StringBuilder
        LogPaths = @($stdoutLog, $stderrLog)
    }
}

Set-Location $ProjectRoot

try {
Write-Step "Detecting existing Next.js dev servers for Project Atlas"
$killed = Stop-StaleNextDevServers
if ($killed.Count -eq 0) {
    Write-Info "No stale Project Atlas Next.js dev servers found."
}
else {
    Write-Info "Stopped $($killed.Count) stale dev server process(es)."
}

Write-Step "Starting next dev --turbopack"
$dev = Start-DevServer
$localUrl = Wait-ForLocalUrl -Process $dev.Process -LogPaths $dev.LogPaths -OutputBuffer $dev.OutputBuffer

Write-Step "Verifying HTTP 200"
$verification = Test-HttpOk -Url $localUrl

Write-Step "Opening verified Local URL"
Start-Process $localUrl | Out-Null

Write-Host ""
Write-Host "Local URL: $localUrl" -ForegroundColor Green
Write-Host "HTTP status: $($verification.StatusCode)" -ForegroundColor Green
Write-Host "Dev server PID: $($dev.Process.Id)" -ForegroundColor Green

if ($killed.Count -gt 0) {
    Write-Host ""
    Write-Host "Killed processes:" -ForegroundColor Yellow
    foreach ($item in $killed) {
        Write-Host "  PID $($item.PID) ($($item.Source))"
    }
}

Write-Host ""
Write-Host "Single dev server is running. Press Ctrl+C in this terminal to stop it." -ForegroundColor DarkGray

try {
    $dev.Process.WaitForExit()
}
finally {
    if (-not $dev.Process.HasExited) {
        Stop-Process -Id $dev.Process.Id -Force -ErrorAction SilentlyContinue
    }
}
}
catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ScriptStackTrace) {
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    }
    exit 1
}
