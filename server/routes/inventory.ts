import { Router } from 'express';
import { pool } from '../db';;
import { authenticate } from './auth';;

const router = Router();
router.use(authenticate);

router.get('/transactions', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM inventory_transactions';
    let countQuery = 'SELECT COUNT(*) as total FROM inventory_transactions';
    let queryParams: any[] = [];
    
    if (search) {
      query += ' WHERE medicine_name LIKE ? OR reference LIKE ?';
      countQuery += ' WHERE medicine_name LIKE ? OR reference LIKE ?';
      const searchStr = `%${search}%`;
      queryParams = [searchStr, searchStr];
    }
    
    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    
    const [rows] = await pool.query(query, [...queryParams, Number(limit), offset]);
    const [countRows]: any = await pool.query(countQuery, queryParams);
    
    res.json({
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/transactions', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const tx = req.body;
    await connection.beginTransaction();

    const medicineId = tx.medicineId || tx.medicine_id;
    const medicineName = tx.medicineName || tx.medicine_name;

    await connection.query(
      `INSERT INTO inventory_transactions (medicine_id, medicine_name, type, quantity, reason, reference, performer) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [medicineId, medicineName, tx.type, tx.quantity, tx.reason, tx.reference, tx.performer]
    );

    // Update medicine stock
    let qtyChange: number;
    if (tx.type === 'IN') {
      qtyChange = Math.abs(tx.quantity);
    } else if (tx.type === 'OUT' || tx.type === 'TRANSFER') {
      qtyChange = -Math.abs(tx.quantity);
    } else if (tx.type === 'ADJUST') {
      qtyChange = tx.quantity; // ADJUST can be positive or negative, use as-is
    } else {
      qtyChange = tx.quantity;
    }
    await connection.query(
      `UPDATE medicines SET stock = stock + ? WHERE id = ?`,
      [qtyChange, medicineId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Transaction created' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
