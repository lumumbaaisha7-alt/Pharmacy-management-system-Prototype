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
  const connection = await pool.getConnection();
  try {
    const tx = req.body;
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO inventory_transactions (medicine_id, medicine_name, type, quantity, reason, reference, performer) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tx.medicine_id, tx.medicine_name, tx.type, tx.quantity, tx.reason, tx.reference, tx.performer]
    );

    // Update medicine stock
    const qtyChange = tx.type === 'IN' ? tx.quantity : (tx.type === 'OUT' ? -tx.quantity : tx.quantity);
    await connection.query(
      `UPDATE medicines SET stock = stock + ? WHERE id = ?`,
      [qtyChange, tx.medicine_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Transaction created' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

export default router;
