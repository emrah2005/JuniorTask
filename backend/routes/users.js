const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('SuperAdmin','Admin'), async (req, res) => {
  try {
    const [users] = await req.pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/',
  authenticateToken,
  authorizeRoles('SuperAdmin', 'Admin'),
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Admin', 'User']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password, role } = req.body;
      const [existing] = await req.pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const [result] = await req.pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashed, role]
      );
      res.status(201).json({ id: result.insertId, name, email, role });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await req.pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
