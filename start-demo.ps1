$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $ProjectRoot "server.js"

$NodeCandidates = @(
  "node",
  "C:\Program Files\nodejs\node.exe",
  "C:\Users\Joela\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

$NodeExe = $null
foreach ($Candidate in $NodeCandidates) {
  try {
    $Command = Get-Command $Candidate -ErrorAction Stop
    $NodeExe = $Command.Source
    break
  } catch {
    if (Test-Path $Candidate) {
      $NodeExe = $Candidate
      break
    }
  }
}

if (-not $NodeExe) {
  Write-Host "Node.js was not found. Install Node.js LTS from https://nodejs.org."
  exit 1
}

Write-Host "Starting PII Safe LLM Gateway with $NodeExe"
Write-Host "Open http://127.0.0.1:5188"
Start-Process "http://127.0.0.1:5188"
& $NodeExe $ServerPath
