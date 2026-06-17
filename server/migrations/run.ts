import fs from 'fs';
import path from 'path';
import { pool } from '../db';;

async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'migrations', '001_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schemaSql.split(';').filter((stmt: string) => stmt.trim() !== '');
    
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Migrations executed successfully!');
  } catch (error) {
    console.error('Error executing migrations:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

runMigrations();
