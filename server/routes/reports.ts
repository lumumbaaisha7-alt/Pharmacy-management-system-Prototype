import { Router } from 'express';
import { pool } from '../db';;
import { authenticate } from './auth';;

const router = Router();
router.use(authenticate);

router.get('/sales', async (req, res) => {
  try {
    const [daily]: any = await pool.query(
      `SELECT DATE(created_at) as date, SUM(total) as sales, COUNT(*) as orders 
       FROM sales 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`
    );
    
    const [monthly]: any = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue 
       FROM sales 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
       GROUP BY month 
       ORDER BY month ASC`
    );

    res.json({ daily, monthly });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/top-medicines', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT medicine_name as name, SUM(quantity) as sold, SUM(total_price) as revenue 
       FROM sale_items 
       GROUP BY medicine_id, medicine_name 
       ORDER BY revenue DESC LIMIT 10`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM medicines WHERE stock < 50 ORDER BY stock ASC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/expiring-soon', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) ORDER BY expiry_date ASC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/inventory-valuation', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT category, SUM(stock * purchase_price) as total_value, COUNT(*) as item_count 
       FROM medicines 
       GROUP BY category`
    );
    const [grandTotal]: any = await pool.query(`SELECT SUM(stock * purchase_price) as grand_total FROM medicines`);
    res.json({ categories: rows, grand_total: grandTotal[0]?.grand_total || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
