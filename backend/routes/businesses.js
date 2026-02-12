const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const businessValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Business name must be at least 2 characters'),
  body('type').isIn(['Barber', 'Gym', 'Training Hall', 'Car Wash']).withMessage('Invalid business type')
];

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT b.*, u.name as owner_name, u.email as owner_email
      FROM businesses b
      JOIN users u ON b.owner_id = u.id
    `;
    
    if (req.user.role === 'Admin') {
      query += ' WHERE b.owner_id = ?';
      const [businesses] = await req.pool.execute(query, [req.user.userId]);
      return res.json(businesses);
    }
    
    const [businesses] = await req.pool.execute(query);
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [businesses] = await req.pool.execute(
      `SELECT b.*, u.name as owner_name 
       FROM businesses b 
       JOIN users u ON b.owner_id = u.id 
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(businesses[0]);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), businessValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type } = req.body;

    const [result] = await req.pool.execute(
      'INSERT INTO businesses (owner_id, name, type) VALUES (?, ?, ?)',
      [req.user.userId, name, type]
    );

    res.status(201).json({
      message: 'Business created successfully',
      business: { id: result.insertId, owner_id: req.user.userId, name, type }
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), businessValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type } = req.body;

    const [businesses] = await req.pool.execute(
      'SELECT owner_id FROM businesses WHERE id = ?',
      [req.params.id]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.role === 'Admin' && businesses[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.pool.execute(
      'UPDATE businesses SET name = ?, type = ? WHERE id = ?',
      [name, type, req.params.id]
    );

    res.json({ message: 'Business updated successfully' });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const [businesses] = await req.pool.execute(
      'SELECT owner_id FROM businesses WHERE id = ?',
      [req.params.id]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.role === 'Admin' && businesses[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.pool.execute('DELETE FROM businesses WHERE id = ?', [req.params.id]);

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
