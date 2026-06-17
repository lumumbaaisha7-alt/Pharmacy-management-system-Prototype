import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Log database configuration on startup
console.log('=== DATABASE CONFIGURATION ===');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost (DEFAULT)');
console.log('DB_PORT:', process.env.DB_PORT || '3306 (DEFAULT)');
console.log('DB_USER:', process.env.DB_USER || 'root (DEFAULT)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET (empty password)');
console.log('DB_NAME:', process.env.DB_NAME || 'pharmaflow (DEFAULT)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('==============================\n');

// Determine SSL configuration based on environment
const getSSLConfig = () => {
  const host = process.env.DB_HOST || 'localhost';
  
  // For Railway and cloud deployments (not localhost)
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    console.log('🔒 Remote database detected, enabling SSL...');
    
    // For Railway: use rejectUnauthorized: true for secure connections
    // Railway provides proper certificates
    return {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2' as any
    };
  }
  
  // For local development
  return undefined;
};

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmaflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: getSSLConfig(),
  // Connection attributes for better diagnostics
  connectionAttributes: {
    _client_name: 'pharmacy-management-system',
    _client_version: '1.0.0'
  }
});

// Enhanced error logging
pool.on('error', (err: any) => {
  console.error('❌ Unexpected error on idle client:', {
    code: err?.code,
    errno: err?.errno,
    message: err?.message,
    sqlState: err?.sqlState
  });
});

// Log successful pool creation
pool.on('connection', () => {
  console.log('✅ New database connection established');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end((err) => {
    if (err) {
      console.error('Error closing database pool:', err);
    } else {
      console.log('Database pool closed');
    }
  });
});
