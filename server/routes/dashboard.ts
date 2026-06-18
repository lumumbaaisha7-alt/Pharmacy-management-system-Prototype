import { Router } from 'express';
import { pool } from '../db';;
import { authenticate } from './auth';;

const router = Router();
router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    // today sales
    const [todayRows]: any = await pool.query(`SELECT SUM(total) as total FROM sales WHERE DATE(created_at) = CURDATE()`);
    // monthly sales
    const [monthRows]: any = await pool.query(`SELECT SUM(total) as total FROM sales WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`);
    
    // total medicines
    const [medRows]: any = await pool.query(`SELECT COUNT(*) as total FROM medicines`);
    
    // low stock
    const [lowStockRows]: any = await pool.query(`SELECT COUNT(*) as total FROM medicines WHERE stock < 50`);
    
    // expiring soon (90 days)
    const [expiringRows]: any = await pool.query(`SELECT COUNT(*) as total FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)`);
    
    // recent sales
    const [recentSales] = await pool.query(`SELECT * FROM sales ORDER BY created_at DESC LIMIT 5`);
    
    // low stock alerts
    const [lowStockAlerts] = await pool.query(`SELECT id, name, stock FROM medicines WHERE stock < 50 ORDER BY stock ASC LIMIT 10`);

    // expiring alerts
    const [expiringSoonAlerts] = await pool.query(`SELECT id, name, expiry_date as expiry FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY expiry_date ASC LIMIT 10`);

    res.json({
      todaySales: todayRows[0]?.total || 0,
      monthlySales: monthRows[0]?.total || 0,
      totalMedicines: medRows[0]?.total || 0,
      lowStockCount: lowStockRows[0]?.total || 0,
      expiringSoonCount: expiringRows[0]?.total || 0,
      recentSales: recentSales,
      lowStockAlerts: lowStockAlerts,
      expiringSoonAlerts: expiringSoonAlerts
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
