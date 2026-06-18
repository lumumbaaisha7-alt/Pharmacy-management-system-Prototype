import { Router } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function testDbConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err: any) {
    console.error('DB Connection test failed:', err?.message);
    return false;
  }
}

const router = Router();

let installStatus = { step: 0, progress: 0, message: 'Ready', error: null as string | null, complete: false };

router.get('/status', (req, res) => {
  res.json(installStatus);
});

router.post('/', async (req, res) => {
  const dbOk = await testDbConnection();
  if (!dbOk) {
    return res.status(500).json({ error: 'Cannot connect to database. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME environment variables.' });
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
    }

    if (isInstalled) {
      return res.status(409).json({ error: 'App is already installed' });
    }

    installStatus = { step: 1, progress: 10, message: 'Creating database schema...', error: null, complete: false };
    res.status(202).json({ message: 'Installation started' });

    // Run installation asynchronously
    (async () => {
      let connection;
      try {
        connection = await pool.getConnection();
        const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) DEFAULT 'admin',
  \`avatar_url\` MEDIUMTEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \`medicines\` (
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
);

CREATE TABLE IF NOT EXISTS \`inventory_transactions\` (
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
);

CREATE TABLE IF NOT EXISTS \`sales\` (
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
);

CREATE TABLE IF NOT EXISTS \`sale_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`sale_id\` INT NOT NULL,
  \`medicine_id\` VARCHAR(50),
  \`medicine_name\` VARCHAR(255),
  \`quantity\` INT NOT NULL,
  \`unit_price\` DECIMAL(10,2) NOT NULL,
  \`total_price\` DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS \`settings\` (
  \`key_name\` VARCHAR(255) PRIMARY KEY,
  \`value_data\` MEDIUMTEXT
);
`;
        const statements = SCHEMA_SQL
          .split(';')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (stmtErr: any) {
            // Allow duplicate index errors (code 1061) to pass silently
            if (stmtErr?.errno !== 1061 && stmtErr?.errno !== 1050) {
              throw stmtErr;
            }
            console.warn('Skipping already-exists error:', stmtErr?.message);
          }
        }

        // Create indexes safely (ignore if already exist)
        const indexes = [
          'CREATE INDEX idx_medicines_category ON medicines(category)',
          'CREATE INDEX idx_inventory_date ON inventory_transactions(date)',
          'CREATE INDEX idx_sales_date ON sales(created_at)'
        ];
        for (const idx of indexes) {
          try { await connection.query(idx); } catch (e: any) { /* ignore errno 1061 duplicate */ }
        }

        installStatus = { step: 2, progress: 40, message: 'Setting up admin user...', error: null, complete: false };
        
        const passwordHash = await bcrypt.hash(adminDetails.password, 10);
        await connection.query(
          `INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
          [adminDetails.name, adminDetails.email, passwordHash, 'admin']
        );

        installStatus = { step: 3, progress: 60, message: 'Configuring settings...', error: null, complete: false };

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
          await connection.query(`INSERT IGNORE INTO settings (key_name, value_data) VALUES (?, ?)`, [key, val]);
        }

        installStatus = { step: 4, progress: 80, message: 'Adding sample medicines...', error: null, complete: false };

        const medicines = [
          { id: "MED-001", name: "Amoxicillin 500mg", generic_name: "Amoxicillin", category: "Antibiotics", stock: 125, min: 50, selling_price: 2500, purchase_price: 1500, expiry_date: "2026-10-15", batch: "B-2024", barcode: "89012345678" },
          { id: "MED-002", name: "Paracetamol 500mg", generic_name: "Acetaminophen", category: "Analgesics", stock: 450, min: 100, selling_price: 500, purchase_price: 200, expiry_date: "2027-05-20", batch: "P-1123", barcode: "89023456789" },
          { id: "MED-003", name: "Ibuprofen 400mg", generic_name: "Ibuprofen", category: "NSAIDs", stock: 200, min: 100, selling_price: 1000, purchase_price: 600, expiry_date: "2026-12-01", batch: "I-2331", barcode: "89034567890" },
          { id: "MED-004", name: "Vitamin C 1000mg", generic_name: "Ascorbic Acid", category: "Vitamins", stock: 320, min: 50, selling_price: 1500, purchase_price: 800, expiry_date: "2025-08-10", batch: "V-9901", barcode: "89045678901" }
        ];

        for (const med of medicines) {
          await connection.query(
            `INSERT IGNORE INTO medicines (id, name, generic_name, category, batch_number, barcode, stock, purchase_price, selling_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [med.id, med.name, med.generic_name, med.category, med.batch, med.barcode, med.stock, med.purchase_price, med.selling_price, med.expiry_date]
          );
        }

        installStatus = { step: 5, progress: 100, message: 'Installation complete', error: null, complete: true };
      } catch (err: any) {
        console.error("=== INSTALL ERROR ===", err?.message, err?.stack);
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
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
