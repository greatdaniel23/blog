# Alpha Digital Agency — Clean Deploy Pipeline (PowerShell)
# Rule: commit → push → build → deploy (NO dirty deploys)
# Usage: .\deploy.ps1
#
# Requires: git, npx (wrangler), node
# API token loaded from D:\multiple-agentic\.env

$ErrorActionPreference = "Stop"

$ProjectName = "blogtemplate"
$CFAccountId = "b2a5cc3520b42302ad302f7a4790fbee"
$EnvFile = "D:\multiple-agentic\.env"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ALPHA DIGITAL - Clean Deploy Pipeline" -ForegroundColor Cyan
Write-Host "  Project: $ProjectName" -ForegroundColor Cyan
Write-Host "  Rule: DEPLOY FROM GIT ONLY (origin/main)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Gate 1: Fetch latest from origin
Write-Host ""
Write-Host "[1/5] Fetching latest from origin..." -ForegroundColor Yellow
git fetch origin
$Remote = git rev-parse origin/main
Write-Host "OK - origin/main = $Remote" -ForegroundColor Green

# Gate 2: Hard reset to origin/main
Write-Host ""
Write-Host "[2/5] Hard resetting to origin/main (discarding ALL local changes)..." -ForegroundColor Yellow
git reset --hard origin/main | Out-Null
git clean -fd | Out-Null

$CommitHash = git rev-parse --short HEAD
$CommitMsg = git log -1 --pretty=%s
Write-Host "Deploying from git: $CommitHash - $CommitMsg" -ForegroundColor Cyan

# Gate 3: API token check
Write-Host ""
Write-Host "[3/5] Checking Cloudflare API token..." -ForegroundColor Yellow
if (-not $env:CLOUDFLARE_API_TOKEN) {
    if (Test-Path $EnvFile) {
        Write-Host "Loading CLOUDFLARE_API_TOKEN from $EnvFile" -ForegroundColor Gray
        $TokenLine = Get-Content $EnvFile | Where-Object { $_ -match '^CLOUDFLARE_API_TOKEN=' } | Select-Object -First 1
        $env:CLOUDFLARE_API_TOKEN = ($TokenLine -split '=', 2)[1]
    }
}

if (-not $env:CLOUDFLARE_API_TOKEN) {
    Write-Host "FAIL: CLOUDFLARE_API_TOKEN not set." -ForegroundColor Red
    Write-Host "Set it in your environment or in $EnvFile" -ForegroundColor Yellow
    exit 1
}
$env:CLOUDFLARE_ACCOUNT_ID = $CFAccountId
Write-Host "OK - API token loaded." -ForegroundColor Green

# Gate 4: Build
Write-Host ""
Write-Host "[4/5] Building Astro..." -ForegroundColor Yellow
npx astro build
Write-Host "OK - Build complete." -ForegroundColor Green

# Gate 5: Deploy
Write-Host ""
Write-Host "[5/5] Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist `
    --project-name $ProjectName `
    --branch main `
    --commit-hash $CommitHash

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  DEPLOY COMPLETE" -ForegroundColor Green
Write-Host "  Commit: $CommitHash" -ForegroundColor Green
Write-Host "  Message: $CommitMsg" -ForegroundColor Green
Write-Host "  Preview: https://$CommitHash.$ProjectName.pages.dev" -ForegroundColor Green
Write-Host "  Live: https://alphadigitalagency.id" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
