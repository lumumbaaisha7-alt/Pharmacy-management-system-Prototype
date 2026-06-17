import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';;

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.get('/me', authenticate, async (req: any, res) => {
  try {
    const [rows]: any = await pool.query('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticate, async (req: any, res) => {
  try {
    const { name, avatar_url } = req.body;
    await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', [name, avatar_url, req.user.id]);
    const [rows]: any = await pool.query('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
