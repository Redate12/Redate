# Windows Setup Guide for REDATE

## 1. Instalar Node.js

# Descargar e instalar:
# https://nodejs.org/download/release/v18.19.1/
# Node.js v18.19.1 LTS (Long Term Support)
# Windows Installer (x64)

# Después de instalación, verificar:
node --version
npm --version

# Debería mostrar:
# v18.19.1
# 9.x.x

---

## 2. Instalar Git (si no lo tienes)

# Descargar e instalar:
# https://git-scm.com/download/win

# Verificar:
git --version
# Debería mostrar: git version 2.x.x

---

## 3. Instalar Docker Desktop (opcional pero recomendado)

# Descargar e instalar:
# https://www.docker.com/products/docker-desktop

# Después de instalación, verificar en PowerShell:
docker --version
docker-compose --version

# Si Docker Desktop no corre en tu Windows, 
# podemos usar PostgreSQL y Redis local en su lugar

---

## 4. Instalar PostgreSQL (alternativa a Docker)

# Descargar e instalar:
# https://www.postgresql.org/download/windows/

# During installation:
# Password: redate_password (o lo que quieras)
# Port: 5432 (default)

# Crear database después de instalación:
# Using pgAdmin (included with PostgreSQL):
# 1. Open pgAdmin
# 2. Create database: redate_db
# Or using psql in PowerShell:
psql -U postgres -c "CREATE DATABASE redate_db;"

---

## 5. Instalar Redis (alternativa a Docker)

# Opción A: Use Memurai (Redis en Windows)
# https://www.memurai.com/get-memurai
# Memurai es Redis compatible con Windows

# Opción B: Usar Redis en Docker
# Si ya tienes Docker Desktop:
docker run -d --name redate-redis -p 6379:6379 redis:7-alpine

# Opción C: Usar Redis Cloud (más fácil)
# https://redis.com/try-free/
# Crear cuenta gratuita (30MB cache)

---

## 6. Instalar Expo CLI (para frontend)

# En PowerShell:
npm install -g expo-cli

# Verificar:
expo --version

---

## 7. Instalar Android Studio (opcional, si quieres usar emulator)

# Descargar e instalar:
# https://developer.android.com/studio

# Installation size: ~5GB
# After installation:
# 1. Open Android Studio
# 2. Tools → Device Manager → Create Device
# 3. Select Pixel 5
# 4. Finish setup (descarga ~1GB)

---

## 8. Opcional: Instalar Chocolatey (package manager para Windows)

# En PowerShell como Admin:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Después de instalar, puedes instalar cosas con:
choco install nodejs
choco install git
choco install docker-desktop
choco install postgresql

---

## 9. Configurar Windows Firewall

# Permitir Node.js en firewall:
# Windows Defender Firewall → Allow an app

# Permitir acceso a:
# - node.exe (para backend - puerto 3000)
# - expo.exe (para frontend - puertos 19000-19006)
# - psql.exe (PostgreSQL - puerto 5432)
# - redis-cli.exe (Redis - puerto 6379)

---

## 10. Configurar VS Code

# Descargar e instalar (si no lo tienes):
# https://code.visualstudio.com/download

# Extensiones recomendadas:
# - ESLint
# - Prettier
# - GitLens
# - Docker (si usas Docker)
# - PostgreSQL
# - REST Client (para test API)

---

## Verificación Final

# En PowerShell, ejecutar estos comandos:

# 1. Node.js
node --version  # v18.19.1
npm --version   # 9.x.x

# 2. Git
git --version   # 2.x.x

# 3. Docker (opcional)
docker --version
docker-compose --version

# 4. PostgreSQL
psql --version

# 5. Redis
redis-cli --version

# 6. Expo CLI
expo --version

# 7. VS Code
code --version

---

## Solución de Problemas Comunes

### "npm command not found"
# Node.js no está instalado o no en PATH
# Reinstalar Node.js y asegurarse de agregar al PATH

### "psql command not found"
# PostgreSQL no está instalado o binarios no en PATH
# Instalar PostgreSQL o usar Docker

### "docker command not found"
# Docker Desktop no está instalado o no iniciado
# Instalar Docker Desktop y asegúrese que está corriendo

### "expo command not found"
# Expo CLI no instalado
# Ejecutar: npm install -g expo-cli

### Puerto 3000 ocupado
# Otro programa usando puerto 3000
# matar proceso:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

### Error de permisos en PowerShell
# Ejecutar como Administrator
# O cambiar ExecutionPolicy:
Set-ExecutionPolicy RemoteSigned

---

## Siguiente Paso

Después de instalar todo, continúa con:

# 1. Setup proyecto backend
cd redate-app/BE
npm install

# 2. Setup proyecto frontend
cd redate-app/FE
npm install

# 3. Configurar variables de entorno (.env)
# 4. Iniciar servidor backend
# 5. Iniciar Expo (frontend)
# 6. Testing con Android smartphone (Expo Go)
