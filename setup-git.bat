@echo off
REM ═══════════════════════════════════════════════════════════════
REM 🪟 REDATE - Git Setup Script (Windows)
REM ═══════════════════════════════════════════════════════════════

echo 🔧 Setting up Git for REDATE Dating App...
echo.

REM Check if .git exists
if exist .git (
    echo ⚠️ Git repository already initialized
    echo.
    set /p reinit="Do you want to reinitialize? (y/N): "
    if /i not "%reinit%"=="y" (
        echo Exiting...
        exit /b 1
    )
    rmdir /s /q .git
)

REM Initialize git
echo 1️⃣ Initializing Git repository...
git init
git config user.name "REDATE Team"
git config user.email "noreply@redate.app"
echo ✅ Git initialized
echo.

REM Add all files
echo 2️⃣ Adding files to Git...
git add .
echo ✅ Files added
echo.

REM Create initial commit
echo 3️⃣ Creating initial commit...
git commit -m "Initial commit - REDATE Dating App MVP

- Backend API complete (Node.js + Express)
- Frontend complete (React Native + Expo)
- Database schema complete (PostgreSQL)
- Documentation complete
- iOS/Android ready"
echo ✅ Initial commit created
echo.

REM Ask about GitHub repository
echo 4️⃣ GitHub Repository Setup
echo.
echo Choose an option:
echo   1. Create new repository (requires gh CLI)
echo   2. Use existing repository
echo   3. Skip (manual setup later)
set /p option="Enter option (1/2/3): "

if "%option%"=="1" goto :CREATE_NEW_REPO
if "%option%"=="2" goto :USE_EXISTING_REPO
if "%option%"=="3" goto :SKIP_GITHUB
echo ❌ Invalid option
exit /b 1

:CREATE_NEW_REPO
echo.
echo Creating new GitHub repository...
echo.

REM Check if gh CLI is installed
where gh >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ GitHub CLI (gh) not installed
    echo.
    echo To install gh CLI:
    echo   Windows: winget install --id GitHub.cli
    echo   Or visit: https://cli.github.com/manual/installation
    echo.
    echo After installing, login with: gh auth login
    exit /b 1
)

REM Check if logged in
gh auth status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Not logged in to GitHub CLI
    echo.
    echo Please login first:
    echo   gh auth login
    exit /b 1
)

REM Get repository name
set /p repo_name="Enter repository name [redate-app]: "
if "%repo_name%"=="" set repo_name=redate-app

REM Get visibility
set /p repo_visibility="Public or private? (P/p=Public, Private=Private) [Private]: "
if "%repo_visibility%"=="P" set repo_visibility_public=--public
if "%repo_visibility%"=="p" set repo_visibility_public=--public
if not defined repo_visibility_public set repo_visibility_public=--private

REM Create repository
echo Creating repository: %repo_name%...
gh repo create "%repo_name%" %repo_visibility_public% --source=. --remote=origin

echo ✅ Repository created: %repo_name%
goto :PUSH_TO_GITHUB

:USE_EXISTING_REPO
echo.
echo Using existing GitHub repository...
echo.

set /p repo_url="Enter repository URL (eg, https://github.com/username/redate-app.git): "

git remote add origin %repo_url%
echo ✅ Remote added: origin → %repo_url%
goto :PUSH_TO_GITHUB

:PUSH_TO_GITHUB
echo.
echo 5️⃣ Pushing to GitHub...
set /p branch_name="Branch name [main]: "
if "%branch_name%"=="" set branch_name=main

git branch -M %branch_name%
git push -u origin %branch_name%

echo ✅ Pushed to GitHub
goto :SUMMARY

:SKIP_GITHUB
echo.
echo Skipping GitHub repository setup
echo.
echo You can add remote later with:
echo   git remote add origin ^<repository-url^>
goto :SUMMARY

:SUMMARY
echo.
echo ══════════════════════════════════════════════════════════════
echo ✅ Git setup complete!
echo.
echo Summary:
echo   • Repository initialized
echo   • Initial commit created
echo   • GitHub repository configured
echo   • Code pushed to GitHub
echo.
echo Next steps:
echo   1. Visit your repository on GitHub
echo   2. Configure environment variables in GitHub Secrets (for CI/CD)
echo   3. Setup CI/CD pipeline (optional)
echo.
echo ══════════════════════════════════════════════════════════════
pause