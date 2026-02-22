// ═══════════════════════════════════════════════════════════════
// 🐙 REDATE - Upload to GitHub via API
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Configuration
const OWNER = 'Redate12';
const REPO = 'Redate';
const BRANCH = 'main';
const BASE_DIR = __dirname;

// Necesitas un GitHub Personal Access Token:
// 1. https://github.com/settings/tokens
// 2. "Generate new token" → repo scope
// 3. Copiar token (solo una vez visible)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'TU_GITHUB_TOKEN_AQUI';

// GitHub API base URL
const GITHUB_API = 'api.github.com';

// Headers para auth
const HEADERS = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'User-Agent': 'REDATE-Bot',
  'Content-Type': 'application/json'
};

// ═══════════════════════════════════════════════════════════════
// Funciones
// ═══════════════════════════════════════════════════════════════

// Verificar si el repo existe y obtener SHA
async function getRepoStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: GITHUB_API,
      path: `/repos/${OWNER}/${REPO}`,
      method: 'GET',
      headers: HEADERS
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject).end();
  });
}

// Crear archivo en GitHub
async function createFile(filePath, content, message) {
  // Leer contenido del archivo
  const fullPath = path.join(BASE_DIR, filePath);

  try {
    const fileContent = fs.readFileSync(fullPath, 'base64');
    const fileName = path.basename(filePath);

    const body = JSON.stringify({
      message: message,
      content: fileContent,
      branch: BRANCH
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: GITHUB_API,
        path: `/repos/${OWNER}/${REPO}/contents/${filePath}`,
        method: 'PUT',
        headers: {
          ...HEADERS,
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Failed to create ${filePath}: ${res.statusCode} - ${data}`));
          } else {
            console.log(`✅ ${filePath} uploaded`);
            resolve(JSON.parse(data));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error.message);
    return null;
  }
}

// Obtener todos los archivos del proyecto (recursivo)
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Excluir ciertas carpetas
      if (!file.includes('node_modules') && !file.includes('.git')) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // Excluir ciertos archivos
      if (!file.includes('.env') && !file.includes('firebase-service-key.json')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Crear archivos en lote para evitar rate limiting
async function uploadFilesBatch(files, batchSize = 5) {
  console.log(`\n🚀 Starting upload of ${files.length} files...`);
  console.log(`Batch size: ${batchSize}`);
  console.log('─────────────────────────────────────────────────\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = path.relative(BASE_DIR, file).replace(/\\/g, '/');

    try {
      const message = `Add ${relativePath}`;
      await createFile(relativePath, null, message);
      successCount++;

      // Pausa entre archivos para evitar rate limiting
      if ((i + 1) % batchSize === 0) {
        console.log(`\n⏸️  Pausing for ${batchSize * 2000}ms...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(error.message);
      failCount++;

      // Si error por rate limit, esperar más tiempo
      if (error.message.includes('403') || error.message.includes('rate limit')) {
        console.log('\n⏸️  Rate limit reached, waiting 60 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }
  }

  console.log('\n─────────────────────────────────────────────────');
  console.log(`\n✅ Upload complete!`);
  console.log(`   Success: ${successCount}/${files.length}`);
  console.log(`   Failed: ${failCount}/${files.length}`);
  console.log(`\n📦 Repository: https://github.com/${OWNER}/${REPO}\n`);
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

if (GITHUB_TOKEN === 'TU_GITHUB_TOKEN_AQUI') {
  console.log('\n❌ ERROR: GitHub token no configurado!');
  console.log('\nPara obtener tu GitHub Personal Access Token:');
  console.log('1. https://github.com/settings/tokens');
  console.log('2. "Generate new token" → repo scope');
  console.log('3. Copiar token');
  console.log('4. Ejecutar: GITHUB_TOKEN=tu_token node upload-to-github.js\n');
  process.exit(1);
}

console.log('🐙 REDATE GitHub Upload Tool');
console.log('═══════════════════════════');
console.log(`Repository: ${OWNER}/${REPO}`);
console.log(`Branch: ${BRANCH}`);
console.log(`Directory: ${BASE_DIR}\n`);

async function main() {
  try {
    // Verificar existe repo
    console.log('🔍 Checking repository...');
    const repoStatus = await getRepoStatus();
    console.log(`✅ Repository found: ${repoStatus.html_url}`);

    // Obtener todos los archivos (excluyendo node_modules, .git, .env)
    console.log('\n📁 Scanning files...');
    const files = getAllFiles(BASE_DIR);
    console.log(`✅ Found ${files.length} files to upload\n`);

    // Upload archivos
    await uploadFilesBatch(files, 3);

    console.log('\n✅ Upload completado con éxito!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('404')) {
      console.log('\n❌ Repositorio no encontrado!');
      console.log('Asegúrate que el repositorio existe en GitHub:\n');
      console.log('https://github.com/Redate12/Redate\n');
    }
    process.exit(1);
  }
}

main();