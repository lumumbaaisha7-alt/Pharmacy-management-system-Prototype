import { Router } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function testDbConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 as connected');
    connection.release();
    return { success: true };
  } catch (err: any) {
    console.error('DB Connection test failed:', err?.message);
    return {
      success: false,
      error: err?.message || 'Unknown connection error',
      details: { code: err?.code, errno: err?.errno }
    };
  }
}

const router = Router();

let installStatus = {
  step: 0,
  progress: 0,
  message: 'Ready',
  error: null as string | null,
  complete: false
};

router.get('/status', (req, res) => {
  res.json(installStatus);
});

router.post('/', async (req, res) => {
  console.log('=== INSTALL ENDPOINT CALLED ===');

  const dbTest = await testDbConnection();
  if (!dbTest.success) {
    return res.status(500).json({
      error: 'Cannot connect to database',
      details: dbTest.details,
      message: `DB Error: ${dbTest.error}`
    });
  }

  try {
    const { pharmacyDetails, adminDetails, branding } = req.body;

    // Check if already installed
    let isInstalled = false;
    try {
      const [rows]: any = await pool.query(
        'SELECT value_data FROM settings WHERE key_name = ?',
        ['app_installed']
      );
      if (rows.length > 0 && rows[0].value_data === 'true') {
        isInstalled = true;
      }
    } catch (e) {
      // Table doesn't exist yet — expected on first run
    }

    if (isInstalled) {
      return res.status(409).json({ error: 'App is already installed' });
    }

    installStatus = {
      step: 1,
      progress: 10,
      message: 'Creating database tables...',
      error: null,
      complete: false
    };

    res.status(202).json({ message: 'Installation started' });

    // Run async
    (async () => {
      let connection: any;
      try {
        connection = await pool.getConnection();
        console.log('=== STARTING INSTALLATION ===');

        // Each table as a separate statement — mysql2 does not support
        // multiple statements in one query() call by default
        const tables = [
          {
            name: 'users',
            sql: `CREATE TABLE IF NOT EXISTS \`users\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`name\` VARCHAR(255) NOT NULL,
              \`email\` VARCHAR(255) NOT NULL UNIQUE,
              \`password_hash\` VARCHAR(255) NOT NULL,
              \`role\` VARCHAR(50) DEFAULT 'admin',
              \`avatar_url\` MEDIUMTEXT,
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
          },
          {
            name: 'medicines',
            sql: `CREATE TABLE IF NOT EXISTS \`medicines\` (
              \`id\` VARCHAR(50) PRIMARY KEY,
              \`name\` VARCHAR(255) NOT NULL,
              \`generic_name\` VARCHAR(255),
              \`category\` VARCHAR(100),
              \`batch_number\` VARCHAR(100),
              \`barcode\` VARCHAR(100),
              \`stock\` INT DEFAULT 0,
              \`purchase_price\` DECIMAL(10,2) NOT NULL,
              \`selling_price\` DECIMAL(10,2) NOT NULL,
              \`expiry_date\` DATE,
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
          },
          {
            name: 'inventory_transactions',
            sql: `CREATE TABLE IF NOT EXISTS \`inventory_transactions\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              \`medicine_id\` VARCHAR(50),
              \`medicine_name\` VARCHAR(255),
              \`type\` VARCHAR(20) NOT NULL,
              \`quantity\` INT NOT NULL,
              \`reason\` VARCHAR(255),
              \`reference\` VARCHAR(255),
              \`performer\` VARCHAR(255),
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
          },
          {
            name: 'sales',
            sql: `CREATE TABLE IF NOT EXISTS \`sales\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`receipt_number\` VARCHAR(100) UNIQUE NOT NULL,
              \`cashier_id\` INT,
              \`subtotal\` DECIMAL(10,2) NOT NULL,
              \`tax\` DECIMAL(10,2) NOT NULL,
              \`discount\` DECIMAL(10,2) DEFAULT 0,
              \`total\` DECIMAL(10,2) NOT NULL,
              \`payment_method\` VARCHAR(50),
              \`amount_given\` DECIMAL(10,2),
              \`change_given\` DECIMAL(10,2),
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
          },
          {
            name: 'sale_items',
            sql: `CREATE TABLE IF NOT EXISTS \`sale_items\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`sale_id\` INT NOT NULL,
              \`medicine_id\` VARCHAR(50),
              \`medicine_name\` VARCHAR(255),
              \`quantity\` INT NOT NULL,
              \`unit_price\` DECIMAL(10,2) NOT NULL,
              \`total_price\` DECIMAL(10,2) NOT NULL
            )`
          },
          {
            name: 'settings',
            sql: `CREATE TABLE IF NOT EXISTS \`settings\` (
              \`key_name\` VARCHAR(255) PRIMARY KEY,
              \`value_data\` MEDIUMTEXT
            )`
          }
        ];

        for (const table of tables) {
          try {
            console.log(`Creating table: ${table.name}`);
            await connection.query(table.sql);
            console.log(`✓ Table ${table.name} ready`);
          } catch (err: any) {
            // 1050 = table already exists — safe to ignore
            if (err?.errno !== 1050) {
              throw new Error(`Failed creating table ${table.name}: ${err?.message} (errno: ${err?.errno})`);
            }
            console.log(`Table ${table.name} already exists, skipping`);
          }
        }

        installStatus = {
          step: 2,
          progress: 40,
          message: 'Setting up admin user...',
          error: null,
          complete: false
        };

        // Create admin user
        const passwordHash = await bcrypt.hash(adminDetails.password, 10);
        await connection.query(
          `INSERT IGNORE INTO \`users\` (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
          [adminDetails.name, adminDetails.email, passwordHash, 'admin']
        );
        console.log('✓ Admin user created');

        installStatus = {
          step: 3,
          progress: 60,
          message: 'Saving settings...',
          error: null,
          complete: false
        };

        // Save settings one by one
        const settings: [string, string][] = [
          ['pharmacy_name', pharmacyDetails.name || ''],
          ['phone', pharmacyDetails.phone || ''],
          ['email', pharmacyDetails.email || ''],
          ['address', pharmacyDetails.address || ''],
          ['currency', branding?.currency || 'TZS'],
          ['timezone', branding?.timezone || 'Africa/Dar_es_Salaam'],
          ['tax_rate', '18'],
          ['app_installed', 'true']
        ];

        if (branding?.logo_base64) settings.push(['logo_base64', branding.logo_base64]);
        if (branding?.favicon_base64) settings.push(['favicon_base64', branding.favicon_base64]);

        for (const [key, val] of settings) {
          await connection.query(
            `INSERT IGNORE INTO \`settings\` (key_name, value_data) VALUES (?, ?)`,
            [key, val]
          );
        }
        console.log('✓ Settings saved');

        installStatus = {
          step: 4,
          progress: 80,
          message: 'Adding sample medicines...',
          error: null,
          complete: false
        };

        // Sample medicines
        const medicines = [
          ['MED-001', 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'AMO-001', '7891234567890', 125, 1500, 2500, '2026-10-15'],
          ['MED-002', 'Paracetamol 500mg', 'Acetaminophen', 'Analgesics', 'PAR-001', '7891234567891', 450, 200, 500, '2027-05-20'],
          ['MED-003', 'Ibuprofen 400mg', 'Ibuprofen', 'NSAIDs', 'IBU-001', '7891234567892', 200, 600, 1000, '2026-12-01'],
          ['MED-004', 'Vitamin C 1000mg', 'Ascorbic Acid', 'Vitamins', 'VIT-001', '7891234567893', 320, 800, 1500, '2027-08-10']
        ];

        for (const med of medicines) {
          await connection.query(
            `INSERT IGNORE INTO \`medicines\` (id, name, generic_name, category, batch_number, barcode, stock, purchase_price, selling_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            med
          );
        }
        console.log('✓ Sample medicines added');

        installStatus = {
          step: 5,
          progress: 100,
          message: 'Installation complete!',
          error: null,
          complete: true
        };
        console.log('=== INSTALLATION COMPLETE ===');

      } catch (err: any) {
        console.error('=== INSTALL ERROR ===', err?.message);
        installStatus = {
          step: -1,
          progress: 0,
          message: 'Installation failed: ' + (err?.message || 'Unknown error'),
          error: err?.message || 'Unknown error',
          complete: false
        };
      } finally {
        if (connection) connection.release();
      }
    })();

  } catch (err: any) {
    console.error('POST /install outer error:', err);
    res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

export default router;
