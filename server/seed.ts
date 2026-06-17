import bcrypt from 'bcrypt';
import { pool } from './db';;

const seedData = async () => {
  const connection = await pool.getConnection();
  try {
    // 1. Admin user
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await connection.query(
      `INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['System Admin', 'admin@pharmaflow.com', passwordHash, 'admin']
    );

    // 2. Settings
    const settings = [
      ['pharmacy_name', 'MediCare Pharmacy'],
      ['phone', '+255 123 456 789'],
      ['email', 'contact@medicare.com'],
      ['address', '123 Health Ave, Medical District'],
      ['currency', 'TZS'],
      ['timezone', 'Africa/Dar_es_Salaam'],
      ['tax_rate', '18']
    ];
    for (const [key, val] of settings) {
      await connection.query(`INSERT IGNORE INTO settings (key_name, value_data) VALUES (?, ?)`, [key, val]);
    }

    // 3. Medicines
    const medicines = [
      { id: "MED-001", name: "Amoxicillin 500mg", generic_name: "Amoxicillin", category: "Antibiotics", stock: 125, min: 50, selling_price: 2500, purchase_price: 1500, expiry_date: "2026-10-15", batch: "B-2024", barcode: "89012345678" },
      { id: "MED-002", name: "Paracetamol 500mg", generic_name: "Acetaminophen", category: "Analgesics", stock: 450, min: 100, selling_price: 500, purchase_price: 200, expiry_date: "2027-05-20", batch: "P-1123", barcode: "89023456789" },
      { id: "MED-003", name: "Ibuprofen 400mg", generic_name: "Ibuprofen", category: "NSAIDs", stock: 200, min: 100, selling_price: 1000, purchase_price: 600, expiry_date: "2026-12-01", batch: "I-2331", barcode: "89034567890" },
      { id: "MED-004", name: "Vitamin C 1000mg", generic_name: "Ascorbic Acid", category: "Vitamins", stock: 320, min: 50, selling_price: 1500, purchase_price: 800, expiry_date: "2025-08-10", batch: "V-9901", barcode: "89045678901" },
      { id: "MED-005", name: "Cough Syrup 100ml", generic_name: "Dextromethorphan", category: "Respiratory", stock: 15, min: 30, selling_price: 3500, purchase_price: 2000, expiry_date: "2026-03-12", batch: "C-4452", barcode: "89056789012" },
      { id: "MED-006", name: "Loratadine 10mg", generic_name: "Loratadine", category: "Antihistamines", stock: 110, min: 40, selling_price: 1200, purchase_price: 700, expiry_date: "2027-01-20", batch: "L-3321", barcode: "89067890123" },
      { id: "MED-007", name: "Omeprazole 20mg", generic_name: "Omeprazole", category: "Gastrointestinal", stock: 85, min: 50, selling_price: 2000, purchase_price: 1000, expiry_date: "2026-06-15", batch: "O-5561", barcode: "89078901234" },
      { id: "MED-008", name: "Aspirin 81mg", generic_name: "Aspirin", category: "Cardiovascular", stock: 210, min: 100, selling_price: 800, purchase_price: 300, expiry_date: "2026-11-25", batch: "A-1229", barcode: "89089012345" },
      { id: "MED-009", name: "Metformin 500mg", generic_name: "Metformin", category: "Antidiabetics", stock: 150, min: 80, selling_price: 1800, purchase_price: 900, expiry_date: "2027-08-15", batch: "M-4478", barcode: "89090123456" },
      { id: "MED-010", name: "Ciprofloxacin 500mg", generic_name: "Ciprofloxacin", category: "Antibiotics", stock: 0, min: 40, selling_price: 3000, purchase_price: 1800, expiry_date: "2026-02-10", batch: "C-8891", barcode: "89101234567" }
    ];

    for (const med of medicines) {
      await connection.query(
        `INSERT IGNORE INTO medicines (id, name, generic_name, category, batch_number, barcode, stock, purchase_price, selling_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [med.id, med.name, med.generic_name, med.category, med.batch, med.barcode, med.stock, med.purchase_price, med.selling_price, med.expiry_date]
      );
    }

    // 4. Inventory transactions
    const tx = [
      ["MED-001", "Amoxicillin 500mg", "IN", 100, "Purchase order", "PO-1002", "Admin"],
      ["MED-005", "Cough Syrup 100ml", "OUT", 10, "Damaged stock", "DMG-001", "Admin"],
      ["MED-003", "Ibuprofen 400mg", "IN", 50, "Restock", "PO-1003", "Admin"],
      ["MED-010", "Ciprofloxacin 500mg", "ADJUST", -5, "Inventory count adjustment", "ADJ-001", "Admin"],
      ["MED-002", "Paracetamol 500mg", "IN", 200, "Bulk purchase", "PO-1004", "Admin"]
    ];

    for (const t of tx) {
      await connection.query(
        `INSERT INTO inventory_transactions (medicine_id, medicine_name, type, quantity, reason, reference, performer) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        t
      );
    }

    console.log("Database seeded successfully");
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    connection.release();
    process.exit();
  }
};

seedData();
