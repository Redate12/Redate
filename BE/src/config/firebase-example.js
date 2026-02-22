// Firebase Admin SDK Configuration
// Firebase Project: redateapp
// Database: Realtime Database (europe-west1)
//
// ⚠️ IMPORTANT: This file contains placeholders. For local development:
// 1. Copy BE/src/config/firebase-example.js → BE/src/config/firebase.js
// 2. Replace service account data with your actual Firebase service account JSON
// 3. Do NOT commit this file to GitHub (it's in .gitignore)
//
// Or use environment variables:
// export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"redateapp","private_key_id":"...","private_key":"...","client_email":"..."}'
//

const admin = require('firebase-admin');

// ========================================
// 🔑 SERVICE ACCOUNT CONFIGURATION
// ========================================
// Option 1: Service account from environment variable (RECOMMENDED)
// export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
const serviceAccountData = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

// Option 2: Service account from local file (for development)
// Download from: Firebase Console > Project Settings > Service Accounts
// Save as: BE/src/config/firebase-adminsdk.json
if (!serviceAccountData) {
  try {
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, 'firebase-adminsdk.json');

    if (fs.existsSync(serviceAccountPath)) {
      const localServiceAccount = require('./firebase-adminsdk.json');
      serviceAccountData = localServiceAccount;
      console.log('✅ Firebase: Loaded service account from local file');
    }
  } catch (error) {
    console.warn('⚠️  Firebase: No service account found. Auth features will not work.');
  }
}

// ========================================
// 🔥 INITIALIZE FIREBASE ADMIN SDK
// ========================================
if (!admin.apps.length && serviceAccountData) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountData),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://redateapp-default-rtdb.europe-west1.firebasedatabase.app',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'redateapp.firebasestorage.app'
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log(`📊 Database URL: ${process.env.FIREBASE_DATABASE_URL || 'https://redateapp-default-rtdb.europe-west1.firebasedatabase.app'}`);
}

// ========================================
// 📦 EXPORT FIREBASE SERVICES
// ========================================
const auth = admin.auth();
const db = admin.database();
const storage = admin.storage();
const messaging = admin.messaging();

module.exports = {
  admin,
  auth,
  db,
  storage,
  messaging,
  isInitialized: admin.apps.length > 0
};

// Firebase config for frontend reference
module.exports.firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBZPBwbrnQW2Mpn2j5xaUmTUzVr10YINmk',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'redateapp.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://redateapp-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: process.env.FIREBASE_PROJECT_ID || 'redateapp',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'redateapp.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '467440387876',
  appId: process.env.FIREBASE_APP_ID || '1:467440387876:web:e1f89f229107fab72d55b1',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-78YD6CXCXK'
};