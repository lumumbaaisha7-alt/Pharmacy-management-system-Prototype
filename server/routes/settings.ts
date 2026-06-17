import { Router } from 'express';
import { pool } from '../db';;

const router = Router();

// Allow reading settings without auth for the frontend app load
router.get('/', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM settings');
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => {
      settings[r.key_name] = r.value_data;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update needs auth
import { authenticate } from './auth';;
router.put('/', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    for (const key in updates) {
      await pool.query(
        'INSERT INTO settings (key_name, value_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_data = ?',
        [key, updates[key], updates[key]]
      );
    }
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
