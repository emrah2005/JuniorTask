const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const groupValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('trainer_id').isInt({ min: 1 }).withMessage('Valid trainer required'),
  body('hall').optional().isString(),
  body('schedule_day').optional().isInt({ min: 0, max: 6 }),
  body('schedule_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Invalid price')
];

const updateValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('hall').optional().isString(),
  body('schedule_day').optional().isInt({ min: 0, max: 6 }),
  body('schedule_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Invalid price')
];

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [groups] = await req.pool.execute(`
      SELECT g.*, u.name as trainer_name 
      FROM groups g JOIN users u ON g.trainer_id = u.id
      ORDER BY g.name
    `);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('Admin','SuperAdmin'), groupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, trainer_id, hall, schedule_day, schedule_time, price } = req.body;
    const [result] = await req.pool.execute(
      `INSERT INTO groups (name, trainer_id, hall, schedule_day, schedule_time)
       VALUES (?, ?, ?, ?, ?)`,
      [name, trainer_id, hall || null, schedule_day ?? null, schedule_time ?? null]
    );
    // If price column exists, update price
    if (price != null) {
      try {
        const [cols] = await req.pool.execute(`
          SELECT COUNT(*) as cnt 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groups' AND COLUMN_NAME = 'price'
        `);
        if (cols[0]?.cnt > 0) {
          await req.pool.execute('UPDATE groups SET price = ? WHERE id = ?', [price, result.insertId]);
        }
      } catch (e) {
        console.warn('Price column not available, skipping price update');
      }
    }
    res.status(201).json({ 
      message: 'Group created', 
      group: { id: result.insertId, name, trainer_id, hall, schedule_day, schedule_time, price: price ?? null } 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/trainer/my', authenticateToken, authorizeRoles('Admin','SuperAdmin'), async (req, res) => {
  try {
    const [groups] = await req.pool.execute(
      `SELECT * FROM groups WHERE trainer_id = ? ORDER BY name`,
      [req.user.userId]
    );
    res.json(groups);
  } catch (error) {
    console.error('Error fetching trainer groups:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('Admin','SuperAdmin'), updateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const groupId = Number(req.params.id);
    const [rows] = await req.pool.execute('SELECT * FROM groups WHERE id = ?', [groupId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const existing = rows[0];
    if (req.user.role === 'Admin' && existing.trainer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const name = req.body.name ?? existing.name;
    const hall = req.body.hall !== undefined ? (req.body.hall || null) : existing.hall;
    const schedule_day = req.body.schedule_day !== undefined ? (req.body.schedule_day ?? null) : existing.schedule_day;
    const schedule_time = req.body.schedule_time !== undefined ? (req.body.schedule_time || null) : existing.schedule_time;
    const price = req.body.price !== undefined ? (req.body.price ?? null) : (existing.price ?? null);
    await req.pool.execute(
      `UPDATE groups SET name = ?, hall = ?, schedule_day = ?, schedule_time = ?, price = ? WHERE id = ?`,
      [name, hall, schedule_day, schedule_time, price, groupId]
    );
    res.json({ 
      message: 'Group updated', 
      group: { id: groupId, name, hall, schedule_day, schedule_time, price } 
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
