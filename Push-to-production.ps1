$ErrorActionPreference = "Stop"

# ============================================================
# Tech Compass - Safe Push Script
# ============================================================

$ProjectPath = "C:\Users\rahul.velapure\Downloads\Tech Compass"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Tech Compass - Push Changes" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# 1. Go to project
# ------------------------------------------------------------

if (-not (Test-Path $ProjectPath)) {
    Write-Host "ERROR: Project path not found:" -ForegroundColor Red
    Write-Host $ProjectPath
    exit 1
}

Set-Location $ProjectPath

Write-Host "Project:" -ForegroundColor Gray
Write-Host (Get-Location).Path
Write-Host ""

# ------------------------------------------------------------
# 2. Check Git repository
# ------------------------------------------------------------

git rev-parse --is-inside-work-tree | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: This is not a Git repository." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# 3. Show current state
# ------------------------------------------------------------

Write-Host "Current branch:" -ForegroundColor Yellow
git branch --show-current

Write-Host ""
Write-Host "Current commit:" -ForegroundColor Yellow
git log -1 --oneline

Write-Host ""
Write-Host "Working tree:" -ForegroundColor Yellow
git status --short

Write-Host ""

# ------------------------------------------------------------
# 4. Confirm branch
# ------------------------------------------------------------

$Branch = git branch --show-current

if ([string]::IsNullOrWhiteSpace($Branch)) {
    Write-Host "ERROR: Could not determine current branch." -ForegroundColor Red
    exit 1
}

Write-Host "You are currently on:" -ForegroundColor Cyan
Write-Host "  $Branch"
Write-Host ""

$Confirm = Read-Host "Continue with push? Type YES"

if ($Confirm -ne "YES") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# ------------------------------------------------------------
# 5. Fetch latest remote information
# ------------------------------------------------------------

Write-Host ""
Write-Host "Fetching latest remote information..." -ForegroundColor Cyan

git fetch origin

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git fetch failed." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# 6. Check whether branch is behind
# ------------------------------------------------------------

$RemoteBranch = "origin/$Branch"

$RemoteExists = git show-ref --verify --quiet "refs/remotes/$RemoteBranch"

if ($RemoteExists) {

    $Behind = git rev-list --count "HEAD..$RemoteBranch"
    $Ahead  = git rev-list --count "$RemoteBranch..HEAD"

    Write-Host ""
    Write-Host "Branch status:" -ForegroundColor Yellow
    Write-Host "  Ahead of origin:  $Ahead"
    Write-Host "  Behind origin:    $Behind"

    if ([int]$Behind -gt 0) {

        Write-Host ""
        Write-Host "WARNING: Your local branch is behind origin." -ForegroundColor Red
        Write-Host ""
        Write-Host "Remote commits:" -ForegroundColor Yellow
        git log --oneline "HEAD..$RemoteBranch"

        Write-Host ""
        Write-Host "The script will NOT automatically merge or rebase." -ForegroundColor Yellow
        Write-Host "Resolve this manually first."
        exit 1
    }
}

# ------------------------------------------------------------
# 7. Check working tree
# ------------------------------------------------------------

$Changes = git status --porcelain

if (-not [string]::IsNullOrWhiteSpace($Changes)) {

    Write-Host ""
    Write-Host "Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short

    Write-Host ""

    $CommitMessage = Read-Host "Enter commit message"

    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        Write-Host "ERROR: Commit message cannot be empty." -ForegroundColor Red
        exit 1
    }

    # --------------------------------------------------------
    # 8. Stage changes
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "Staging changes..." -ForegroundColor Cyan

    git add .

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: git add failed." -ForegroundColor Red
        exit 1
    }

    # --------------------------------------------------------
    # 9. Show staged diff
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "Files staged for commit:" -ForegroundColor Yellow
    git diff --cached --stat

    Write-Host ""

    $CommitConfirm = Read-Host "Commit these changes? Type YES"

    if ($CommitConfirm -ne "YES") {
        git reset
        Write-Host "Commit cancelled. Changes remain uncommitted." -ForegroundColor Yellow
        exit 0
    }

    # --------------------------------------------------------
    # 10. Commit
    # --------------------------------------------------------

    git commit -m $CommitMessage

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Commit failed." -ForegroundColor Red
        exit 1
    }

} else {

    Write-Host ""
    Write-Host "Working tree is clean." -ForegroundColor Green
}

# ------------------------------------------------------------
# 11. Final status before push
# ------------------------------------------------------------

Write-Host ""
Write-Host "Final commit:" -ForegroundColor Yellow
git log -1 --oneline

Write-Host ""
Write-Host "Files:" -ForegroundColor Yellow
git status --short

Write-Host ""

# ------------------------------------------------------------
# 12. Push
# ------------------------------------------------------------

$PushConfirm = Read-Host "Push $Branch to origin? Type PUSH"

if ($PushConfirm -ne "PUSH") {
    Write-Host "Push cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Pushing to origin/$Branch..." -ForegroundColor Cyan

git push origin $Branch

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Push failed." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# 13. Final verification
# ------------------------------------------------------------

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " PUSH SUCCESSFUL" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Branch:" -ForegroundColor Gray
git branch --show-current

Write-Host ""
Write-Host "Commit:" -ForegroundColor Gray
git log -1 --oneline

Write-Host ""
Write-Host "Working tree:" -ForegroundColor Gray
git status --short

Write-Host ""
Write-Host "Remote:" -ForegroundColor Gray
git remote -v

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""