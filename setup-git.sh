#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🐙 REDATE - Git Setup Script (Unix/Mac/Linux)
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "🔧 Setting up Git for REDATE Dating App..."
echo ""

# Check if .git exists
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
    echo ""
    read -p "Do you want to reinitialize? (y/N): " reinit
    if [[ ! $reinit =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
    rm -rf .git
fi

# Initialize git
echo "1️⃣  Initializing Git repository..."
git init
git config user.name "REDATE Team"
git config user.email "noreply@redate.app"
echo "✅ Git initialized"
echo ""

# Add all files
echo "2️⃣  Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Create initial commit
echo "3️⃣  Creating initial commit..."
git commit -m "Initial commit - REDATE Dating App MVP

- Backend API complete (Node.js + Express)
- Frontend complete (React Native + Expo)
- Database schema complete (PostgreSQL)
- Documentation complete
- iOS/Android ready"
echo "✅ Initial commit created"
echo ""

# Ask about GitHub repository
echo "4️⃣  GitHub Repository Setup"
echo ""
echo "Choose an option:"
echo "  1. Create new repository (requires gh CLI)"
echo "  2. Use existing repository"
echo "  3. Skip (manual setup later)"
read -p "Enter option (1/2/3): " option

case $option in
    1)
        echo ""
        echo "Creating new GitHub repository..."
        echo ""

        # Check if gh CLI is installed
        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI (gh) not installed"
            echo ""
            echo "To install gh CLI:"
            echo "  macOS:   brew install gh"
            echo "  Linux:   Check: https://cli.github.com/manual/installation"
            echo "  Windows: winget install --id GitHub.cli"
            echo ""
            echo "After installing, login with: gh auth login"
            exit 1
        fi

        # Check if logged in
        if ! gh auth status &> /dev/null; then
            echo "❌ Not logged in to GitHub CLI"
            echo ""
            echo "Please login first:"
            echo "  gh auth login"
            echo ""
            exit 1
        fi

        # Get repository name
        read -p "Enter repository name [redate-app]: " repo_name
        repo_name=${repo_name:-redate-app}

        # Get visibility
        read -p "Public or private? (P/p=Public, Pp/private=Private) [Private]: " repo_visibility
        if [[ $repo_visibility =~ ^[Pp]$ ]]; then
            repo_visibility="public"
        else
            repo_visibility="private"
        fi

        # Create repository
        echo "Creating repository: $repo_name ($repo_visibility)..."
        gh repo create "$repo_name" --$repo_visibility --source=. --remote=origin

        echo "✅ Repository created: $repo_name"
        ;;

    2)
        echo ""
        echo "Using existing GitHub repository..."
        echo ""

        read -p "Enter repository URL (e.g., https://github.com/username/redate-app.git): " repo_url

        git remote add origin "$repo_url"
        echo "✅ Remote added: origin → $repo_url"
        ;;

    3)
        echo ""
        echo "Skipping GitHub repository setup"
        echo ""
        echo "You can add remote later with:"
        echo "  git remote add origin <repository-url>"
        echo ""
        exit 0
        ;;

    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

# Push to GitHub
echo ""
echo "5️⃣  Pushing to GitHub..."
read -p "Branch name [main]: " branch_name
branch_name=${branch_name:-main}

git branch -M $branch_name
git push -u origin $branch_name

echo "✅ Pushed to GitHub"
echo ""

# Summary
echo "══════════════════════════════════════════════════════════════"
echo "✅ Git setup complete!"
echo ""
echo "Summary:"
echo "  • Repository initialized"
echo "  • Initial commit created"
echo "  • GitHub repository configured"
echo "  • Code pushed to GitHub"
echo ""
echo "Next steps:"
echo "  1. Visit your repository on GitHub"
echo "  2. Configure environment variables in GitHub Secrets (for CI/CD)"
echo "  3. Setup CI/CD pipeline (optional)"
echo ""
echo "══════════════════════════════════════════════════════════════"