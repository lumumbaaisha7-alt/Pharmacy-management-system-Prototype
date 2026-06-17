import { Router } from 'express';
import { pool } from '../db';;
import { authenticate } from './auth';;

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = 'SELECT * FROM medicines';
    let countQuery = 'SELECT COUNT(*) as total FROM medicines';
    let queryParams: any[] = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR generic_name LIKE ? OR barcode = ?';
      countQuery += ' WHERE name LIKE ? OR generic_name LIKE ? OR barcode = ?';
      const searchStr = `%${search}%`;
      queryParams = [searchStr, searchStr, search];
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
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

router.post('/', async (req, res) => {
  try {
    const med = req.body;
    await pool.query(
      `INSERT INTO medicines (id, name, generic_name, category, batch_number, barcode, stock, purchase_price, selling_price, expiry_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [med.id, med.name, med.generic_name, med.category, med.batch_number, med.barcode, med.stock, med.purchase_price, med.selling_price, med.expiry_date]
    );
    res.status(201).json({ message: 'Medicine created' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const med = req.body;
    await pool.query(
      `UPDATE medicines SET name=?, generic_name=?, category=?, batch_number=?, barcode=?, stock=?, purchase_price=?, selling_price=?, expiry_date=? WHERE id=?`,
      [med.name, med.generic_name, med.category, med.batch_number, med.barcode, med.stock, med.purchase_price, med.selling_price, med.expiry_date, req.params.id]
    );
    res.json({ message: 'Medicine updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
