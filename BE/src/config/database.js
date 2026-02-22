const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'redate_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'redate_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.on('connect', () => {
  console.log('💕 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('🚨 Unexpected error on idle client', err);
});

module.exports = pool;