import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Determine if we should use SSL (only for non-.internal hosts)
const host = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const shouldUseSSL = !host.includes('.internal') && host !== 'localhost';

export const pool = mysql.createPool({
  host: host,
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10),
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'pharmaflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
});
