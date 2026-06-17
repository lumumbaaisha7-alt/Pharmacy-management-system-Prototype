import { Router } from 'express';
import { pool } from '../db';;
import { authenticate } from './auth';;

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const [rows] = await pool.query(
      'SELECT * FROM sales ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [Number(limit), offset]
    );
    const [countRows]: any = await pool.query('SELECT COUNT(*) as total FROM sales');
    
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

router.post('/', async (req: any, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const sale = req.body;
    await connection.beginTransaction();

    const d = new Date();
    const dateStr = d.toISOString().slice(0,10).replace(/-/g,'');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `R-${dateStr}-${randomStr}`;

    const [saleRes]: any = await connection.query(
      `INSERT INTO sales (receipt_number, cashier_id, subtotal, tax, discount, total, payment_method, amount_given, change_given) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [receiptNumber, req.user.id, sale.subtotal, sale.tax, sale.discount, sale.total, sale.payment_method, sale.amount_given, sale.change_given]
    );

    const saleId = saleRes.insertId;

    for (const item of sale.items) {
      await connection.query(
        `INSERT INTO sale_items (sale_id, medicine_id, medicine_name, quantity, unit_price, total_price) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [saleId, item.medicine_id, item.medicine_name, item.quantity, item.unit_price, item.total_price]
      );

      // Decrement stock
      await connection.query(
        `UPDATE medicines SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.medicine_id]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Sale completed', receiptNumber });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
