# 🐙 REDATE - GitHub Setup Guide

## 🎯 Overview

Complete guide to set up GitHub repository, push code, and configure CI/CD.

---

## 🚀 Opción 1: Script Automático (Más rápido)

### Para Windows:

```powershell
# En PowerShell - cd al proyecto
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app

# Ejecutar script
.\setup-git.bat
```

### Para Mac/Linux:

```bash
cd ~/.openclaw/workspace/redate-app
chmod +x setup-git.sh
./setup-git.sh
```

Script hará:
1. ✅ Initialize Git
2. ✅ Add all files
3. ✅ Create initial commit
4. ✅ Create GitHub repository (si gh CLI instalado)
5. ✅ Push to GitHub

---

## 🛠️ Opción 2: Manual Paso a Paso

### Paso 1: Install GitHub CLI (gh)

**Windows:**
```powershell
winget install --id GitHub.cli
```

**Mac:**
```bash
brew install gh
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install gh

# CentOS/RHEL
sudo yum install gh
```

### Paso 2: Login to GitHub

```bash
gh auth login
```

Seguir instructions:
1. Press Enter (GitHub.com)
2. Press Enter (HTTPS)
3. Login con browser

### Paso 3: Initialize Git Repository

```powershell
# En PowerShell - cd al proyecto
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app

# Initialize git
git init

# Configure user
git config user.name "Tu Nombre"
git config user.email "tu-email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - REDATE Dating App MVP"
```

### Paso 4: Create GitHub Repository

#### Opción A: Via Web (Más fácil)

1. Visit: https://github.com/new
2. Repository name: `redate-app`
3. Description: `REDATE 💕 Dating App - iOS + Android`
4. Public/Private: Tu preferencia
5. Click "Create repository"

#### Opción B: Via CLI

```bash
gh repo create redate-app --public --source=. --remote=origin
```

### Paso 5: Push to GitHub

```bash
# Set branch name
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 🔒 GitHub Secrets (Environment Variables)

For CI/CD workflows, configure secrets in GitHub:

### Via GitHub Web UI:

1. Go to repository: https://github.com/username/redate-app
2. Settings → Secrets and variables → Actions → New repository secret
3. Add each secret:

**FIREBASE:**
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: (paste JSON content)

Name: FIREBASE_API_KEY
Value: (paste API key)
```

**DATABASE:**
```
Name: DATABASE_URL
Value: postgresql://user:password@host:5432/db

Name: REDIS_URL
Value: redis://host:6379
```

**STRIPE:**
```
Name: STRIPE_SECRET_KEY
Value: sk_live_... or sk_test_...

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
```

### Via GitHub CLI:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
gh secret set DATABASE_URL --body "postgresql://user:pass@host:5432/db"
gh secret set STRIPE_SECRET_KEY --body "sk_test_..."
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy REDATE Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: BE/package-lock.json

      - name: Install dependencies
        run: |
          cd BE
          npm ci

      - name: Run tests
        run: |
          cd BE
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: BE/package-lock.json

      - name: Install dependencies
        run: |
          cd BE
          npm ci --only=production

      - name: Deploy to server
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        run: |
          # Add your deployment commands here
          # Example: deploy to Railway/Render/your-server
          echo "Deploying REDATE backend..."
```

File: `.github/workflows/build-ios.yml`

```yaml
name: Build iOS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        run: |
          cd FE
          eas build --platform ios --profile production
```

---

## 📊 Branch Strategy

```
main           → Production code (stable)
  └─ develop   → Development code (work in progress)
       ├─ feature/login
       ├─ feature/swipe-engine
       └─ bugfix/chat-crash
```

### Git Workflow:

```bash
# Create feature branch
git checkout -b feature/swipe-engine

# Make changes
git add .
git commit -m "Add swipe engine"

# Push to GitHub
git push origin feature/swipe-engine

# Create Pull Request via:
gh pr create --title "Add swipe engine" --body "Description..."
```

---

## ✅ Repository Structure After Push

```
username/redate-app/
├── 📁 .github/
│   └── 📁 workflows/ (future CI/CD)
├── 📁 BE/ (Backend)
│   ├── 📁 src/
│   ├── 📁 database/
│   ├── 📁 tests/
│   ├── Dockerfile
│   docker-compose.yml
│   ├── package.json
│   └── .env.example
├── 📁 FE/ (Frontend)
│   ├── 📁 src/
│   ├── 📁 assets/
│   ├── 📁 android/
│   ├── 📁 ios/
│   ├── app.json
│   ├── eas.json
│   └── package.json
├── 📁 docs/
│   ├── API.md
│   ├── STRIPE_GUIDE.md
│   └── WINDOWS_GUIDE.md
├── 📄 README.md
├── 📄 .gitignore
├── 📄 .env.example (safe to commit)
└── 📄 DEPLOYMENT.md
```

---

## 🔐 Security Best Practices

### What NOT to commit:

- ❌ `.env` file (contains secrets)
- ❌ `firebase-service-key.json` (sensitive)
- ❌ Stripe secret keys
- ❌ Database passwords
- ❌ API secrets

### What to commit:

- ✅ `.env.example` (template, no real values)
- ✅ Code, documentation, configs
- ✅ `package.json`, `package-lock.json`
- ✅ Docker compose files
- ✅ Non-sensitive configuration files

---

## 🚀 Verification Steps

After setup, verify:

1. **Repository exists:** Visit https://github.com/username/redate-app
2. **Files pushed:** Check that all files are visible
3. **.env NOT committed:** Confirm `.env` file is NOT in repo
4. **secrets configured:** Check GitHub Secrets in Settings

---

## 🛠️ Useful Git Commands

```bash
# Check status
git status

# View all branches
git branch -a

# View commit history
git log --oneline

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## 🎯 Next Steps

After GitHub setup:

1. ✅ Configure GitHub Secrets (environment variables)
2. ✅ Setup CI/CD pipeline (optional)
3. ✅ Create Pull Request workflow
4. ✅ Create issue tracker (GitHub Issues)
5. ✅ Setup GitHub Wiki (optional)
6. ✅ Setup GitHub Projects (project management)
7. ✅ Configure branch protection rules
8. ✅ Setup CODEOWNERS file

---

**Created:** 2025-02-22
**Status:** GitHub configuration complete