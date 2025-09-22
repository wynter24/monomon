param(
  # Number of requests to send
  [int]$Count = 100,

  # Hide header line (default shows header)
  [switch]$NoHeader,

  # Keep local log file after metrics (default deletes)
  [switch]$KeepLog
)

# ===== Settings =====
$TargetHost = "monomon.vercel.app"
$ApiPath = "/api/match"

# ===== Paths =====
$BaseDir = $PSScriptRoot
if (-not $BaseDir) { $BaseDir = Split-Path -Parent $PSCommandPath }

# Batch / log file
$BID = [guid]::NewGuid().ToString()
$LogFileName = "pino-prod-$BID.log"
$LogFilePath = Join-Path $BaseDir $LogFileName

Write-Host "=== Load Test ===" -ForegroundColor Green
Write-Host "Batch ID: $BID" -ForegroundColor Yellow
Write-Host "Request Count: $Count" -ForegroundColor Yellow
Write-Host "Log File: $LogFilePath" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $LogFilePath) { Remove-Item $LogFilePath -Force }

# ===== Start vercel logs in background (stdout/stderr -> one file) =====
try {
  $cmd = "cmd.exe"
  $cmdArgs = @(
    "/c",
    "chcp 65001 >NUL & vercel logs $TargetHost --follow --json 1>> `"$LogFilePath`" 2>&1"
  )
  $logProc = Start-Process -FilePath $cmd -ArgumentList $cmdArgs -WindowStyle Hidden -PassThru
}
catch {
  Write-Host "❌ vercel CLI failed. Check 'vercel -v' and login status." -ForegroundColor Red
  exit 1
}

Start-Sleep -Seconds 2

# ===== Send requests (Node) =====
Write-Host "→ Sending $Count requests to https://$TargetHost$ApiPath ..." -ForegroundColor Cyan
$RequestScript = @"
const O='https://$TargetHost',B='$BID',N=$Count,P='$ApiPath';
(async()=>{
  for(let i=0;i<N;i++){
    const s=Date.now();
    try{
      const r=await fetch(O+P,{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded','x-batch-id':B},
        body:'image_url=https://res.cloudinary.com/dfgfeq4up/image/upload/v1757531720/test-face_jvoecm.jpg'
      });
      console.log('req',i+1,r.status,(Date.now()-s)+'ms');
    }catch(e){
      console.log('req',i+1,'ERR',(Date.now()-s)+'ms');
    }
    if(i<N-1) await new Promise(r=>setTimeout(r,200));
  }
})().catch(console.error)
"@
node -e $RequestScript

# ===== Stop log capture =====
Write-Host "→ Stopping log capture..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
try {
  if ($logProc) {
    $p = Get-Process -Id $logProc.Id -ErrorAction SilentlyContinue
    if ($p -and -not $p.HasExited) {
      Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
      $p2 = Get-Process -Id $logProc.Id -ErrorAction SilentlyContinue
      if ($p2) { Wait-Process -Id $logProc.Id -Timeout 5 -ErrorAction SilentlyContinue | Out-Null }
    }
  }
}
catch { Write-Host "(info) log capture process already exited." -ForegroundColor DarkGray }

# ===== Check file =====
if (!(Test-Path $LogFilePath)) { Write-Host "❌ Log file not found: $LogFilePath" -ForegroundColor Red; exit 1 }
if ((Get-Item $LogFilePath).Length -eq 0) { Write-Host "❌ Log file is empty: $LogFilePath" -ForegroundColor Red; exit 1 }

# ===== Metrics (header ON by default / -NoHeader to hide) =====
$MetricsTs = Join-Path $BaseDir "pino-metrics-bom.ts"
if ($NoHeader) { $env:PRINT_HEADER = "0" } else { $env:PRINT_HEADER = "1" }

Write-Host "→ Calculating metrics (CSV)..." -ForegroundColor Cyan
npx tsx "$MetricsTs" "$LogFilePath" "$ApiPath" $BID $Count

# ===== Cleanup =====
if (-not $KeepLog) {
  Write-Host "🧹 Deleting log file..." -ForegroundColor DarkGray
  Remove-Item $LogFilePath -Force -ErrorAction SilentlyContinue
}
else {
  Write-Host "📦 Keeping log file: $LogFilePath" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
