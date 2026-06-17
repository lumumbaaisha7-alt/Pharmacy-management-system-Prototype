import { Router } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Diagnostic function to test DB connection and return detailed error info
async function testDbConnectionDetailed(): Promise<{ success: boolean; details: any }> {
  try {
    console.log('=== DATABASE CONNECTION DIAGNOSTICS ===');
    console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET (using localhost)');
    console.log('DB_PORT:', process.env.DB_PORT || '3306');
    console.log('DB_USER:', process.env.DB_USER || 'NOT SET (using root)');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET (using empty)');
    console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET (using pharmaflow)');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    return { 
      success: true, 
      details: {
        status: 'connected',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_NAME || 'pharmaflow'
      }
    };
  } catch (err: any) {
    console.error('❌ DB Connection test failed:', err?.message);
    console.error('Error code:', err?.code);
    console.error('Error errno:', err?.errno);
    console.error('Full error:', err);
    
    let errorReason = 'Unknown error';
    
    // Diagnose specific error types
    if (err?.code === 'PROTOCOL_CONNECTION_LOST') {
      errorReason = 'Connection lost - database server is not responding';
    } else if (err?.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      errorReason = 'Fatal error - check credentials and database exists';
    } else if (err?.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') {
      errorReason = 'Connection protocol error - check DB_PORT is correct';
    } else if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      errorReason = 'Access denied - check DB_USER and DB_PASSWORD';
    } else if (err?.code === 'ER_BAD_DB_ERROR') {
      errorReason = 'Database does not exist - check DB_NAME';
    } else if (err?.code === 'ECONNREFUSED') {
      errorReason = `Cannot connect to ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} - is the database server running?`;
    } else if (err?.code === 'ETIMEDOUT' || err?.code === 'EHOSTUNREACH') {
      errorReason = `Cannot reach database host - check DB_HOST is correct: ${process.env.DB_HOST}`;
    } else if (err?.message?.includes('getaddrinfo')) {
      errorReason = `DNS resolution failed for host: ${process.env.DB_HOST} - check spelling`;
    }
    
    return { 
      success: false, 
      details: {
        status: 'disconnected',
        errorCode: err?.code || 'UNKNOWN',
        errorMessage: err?.message || 'Unknown error',
        errorReason,
        configuredValues: {
          host: process.env.DB_HOST || 'localhost (DEFAULT)',
          port: process.env.DB_PORT || '3306 (DEFAULT)',
          user: process.env.DB_USER || 'root (DEFAULT)',
          database: process.env.DB_NAME || 'pharmaflow (DEFAULT)',
          passwordSet: !!process.env.DB_PASSWORD
        },
        suggestions: [
          'For Railway: Use the connection string format - DB_HOST should be something like "mysql-prod-xxxx.railway.internal"',
          'Verify DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD are exactly as provided by Railway',
          'Check the MySQL service is running and "Online" in Railway dashboard',
          'If using Railway, click "Add Variable Reference" to auto-populate variables'
        ]
      }
    };
  }
}

const router = Router();

interface InstallStatus {
  step: number;
  progress: number;
  message: string;
  error: string | null;
  details?: any;
  complete: boolean;
}

let installStatus: InstallStatus = { 
  step: 0, 
  progress: 0, 
  message: 'Ready', 
  error: null, 
  complete: false 
};

router.get('/status', (req, res) => {
  res.json(installStatus);
});

router.post('/', async (req, res) => {
  const dbTest = await testDbConnectionDetailed();
  
  if (!dbTest.success) {
    console.error('Installation blocked: Database connection failed');
    return res.status(500).json({ 
      error: 'Cannot connect to database',
      ...dbTest.details
    });
  }

  try {
    const { pharmacyDetails, adminDetails, branding } = req.body;
    
    let isInstalled = false;
    try {
      const [rows]: any = await pool.query('SELECT value_data FROM settings WHERE key_name = ?', ['app_installed']);
      if (rows.length > 0 && rows[0].value_data === 'true') {
        isInstalled = true;
      }
    } catch(e) {
      // Table might not exist yet, ignore
      console.log('Settings table does not exist yet (expected on first install)');
    }

    if (isInstalled) {
      return res.status(409).json({ error: 'App is already installed' });
    }

    installStatus = { 
      step: 1, 
      progress: 10, 
      message: 'Creating database schema...', 
      error: null, 
      complete: false 
    };
    res.status(202).json({ message: 'Installation started - poll /api/install/status for progress' });

    // Run installation asynchronously
    (async () => {
      let connection;
      try {
        connection = await pool.getConnection();
        
        // Step 1: Load and validate schema file
        installStatus.message = 'Loading database schema...';
        const schemaPath = path.join(process.cwd(), 'server', 'migrations', '001_schema.sql');
        
        console.log('Schema path:', schemaPath);
        
        // Check if file exists
        if (!fs.existsSync(schemaPath)) {
          throw new Error(`Schema file not found at: ${schemaPath}. Current working directory: ${process.cwd()}`);
        }
        
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql
          .split(';')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && !s.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Step 2: Execute schema
        installStatus.step = 1;
        installStatus.message = 'Creating tables...';
        let stmtIndex = 0;
        
        for (const statement of statements) {
          try {
            stmtIndex++;
            console.log(`Executing statement ${stmtIndex}/${statements.length}...`);
            await connection.query(statement);
            console.log(`✅ Statement ${stmtIndex} succeeded`);
          } catch (stmtErr: any) {
            // Allow duplicate index errors (1061) and table exists errors (1050)
            if (stmtErr?.errno !== 1061 && stmtErr?.errno !== 1050) {
              throw new Error(`SQL Error on statement ${stmtIndex}: ${stmtErr?.message}\nSQL: ${statement.substring(0, 100)}...`);
            }
            console.warn(`⚠️ Skipping statement ${stmtIndex} (already exists): ${stmtErr?.message}`);
          }
        }

        // Step 3: Create admin user
        installStatus.step = 2;
        installStatus.progress = 40;
        installStatus.message = 'Setting up admin user...';
        
        console.log('Creating admin user...');
        const passwordHash = await bcrypt.hash(adminDetails.password, 10);
        await connection.query(
          `INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
          [adminDetails.name, adminDetails.email, passwordHash, 'admin']
        );
        console.log('✅ Admin user created/verified');

        // Step 4: Configure settings
        installStatus.step = 3;
        installStatus.progress = 60;
        installStatus.message = 'Configuring settings...';
        
        console.log('Configuring settings...');
        const settings: [string, string][] = [
          ['pharmacy_name', pharmacyDetails.name],
          ['phone', pharmacyDetails.phone || ''],
          ['email', pharmacyDetails.email || ''],
          ['address', pharmacyDetails.address || ''],
          ['currency', branding.currency || 'TZS'],
          ['timezone', branding.timezone || 'Africa/Dar_es_Salaam'],
          ['tax_rate', '18'],
          ['app_installed', 'true']
        ];
        
        if (branding.logo_base64) settings.push(['logo_base64', branding.logo_base64]);
        if (branding.favicon_base64) settings.push(['favicon_base64', branding.favicon_base64]);
        
        for (const [key, val] of settings) {
          await connection.query(
            `INSERT IGNORE INTO settings (key_name, value_data) VALUES (?, ?)`, 
            [key, val]
          );
        }
        console.log('✅ Settings configured');

        // Step 5: Add sample medicines
        installStatus.step = 4;
        installStatus.progress = 80;
        installStatus.message = 'Adding sample medicines...';
        
        console.log('Adding sample medicines...');
        const medicines = [
          { id: "MED-001", name: "Amoxicillin 500mg", generic_name: "Amoxicillin", category: "Antibiotics", stock: 125, min: 50, selling_price: 2500, purchase_price: 1500, expiry_date: "2026-10-15", batch: "AMX-2024-01", barcode: "1001" },
          { id: "MED-002", name: "Paracetamol 500mg", generic_name: "Acetaminophen", category: "Analgesics", stock: 450, min: 100, selling_price: 500, purchase_price: 200, expiry_date: "2027-05-20", batch: "PAR-2024-02", barcode: "1002" },
          { id: "MED-003", name: "Ibuprofen 400mg", generic_name: "Ibuprofen", category: "NSAIDs", stock: 200, min: 100, selling_price: 1000, purchase_price: 600, expiry_date: "2026-12-01", batch: "IBU-2024-03", barcode: "1003" },
          { id: "MED-004", name: "Vitamin C 1000mg", generic_name: "Ascorbic Acid", category: "Vitamins", stock: 320, min: 50, selling_price: 1500, purchase_price: 800, expiry_date: "2025-08-10", batch: "VIT-2024-04", barcode: "1004" },
        ];

        for (const med of medicines) {
          await connection.query(
            `INSERT IGNORE INTO medicines (id, name, generic_name, category, batch_number, barcode, stock, purchase_price, selling_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [med.id, med.name, med.generic_name, med.category, med.batch, med.barcode, med.stock, med.purchase_price, med.selling_price, med.expiry_date]
          );
        }
        console.log('✅ Sample medicines added');

        // Installation complete
        installStatus.step = 5;
        installStatus.progress = 100;
        installStatus.message = 'Installation complete ✅';
        installStatus.error = null;
        installStatus.complete = true;
        console.log('🎉 Installation completed successfully!');
        
      } catch (err: any) {
        console.error("=== INSTALL ERROR ===");
        console.error("Message:", err?.message);
        console.error("Stack:", err?.stack);
        console.error("Code:", err?.code);
        console.error("Errno:", err?.errno);
        
        installStatus = { 
          step: -1, 
          progress: 0, 
          message: 'Installation failed ❌', 
          error: err?.message || 'Unknown error',
          details: {
            errorType: err?.code || 'UNKNOWN',
            fullMessage: err?.message,
            step: installStatus.step,
            stepName: ['Unknown', 'Creating schema', 'Setting up admin', 'Configuring settings', 'Adding medicines'][installStatus.step] || 'Unknown',
            suggestions: [
              'Check Railway Variables tab - all DB_* variables must be set',
              'Verify MySQL service is "Online" in Railway',
              'Check DB_PASSWORD and DB_USER are correct',
              'Ensure database user has CREATE TABLE permissions',
              'Look at Railway Console logs for more details'
            ]
          },
          complete: false 
        };
      } finally {
        if (connection) connection.release();
      }
    })();
  } catch (err: any) {
    console.error('Install endpoint error:', err);
    res.status(500).json({ 
      error: 'Server error during installation setup',
      message: err?.message 
    });
  }
});

export default router;
