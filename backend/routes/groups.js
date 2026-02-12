const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const groupValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('trainer_id').isInt({ min: 1 }).withMessage('Valid trainer required'),
  body('hall').optional().isString(),
  body('schedule_day').optional().isInt({ min: 0, max: 6 }),
  body('schedule_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time')
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
    const { name, trainer_id, hall, schedule_day, schedule_time } = req.body;
    const [result] = await req.pool.execute(
      `INSERT INTO groups (name, trainer_id, hall, schedule_day, schedule_time)
       VALUES (?, ?, ?, ?, ?)`,
      [name, trainer_id, hall || null, schedule_day ?? null, schedule_time ?? null]
    );
    res.status(201).json({ 
      message: 'Group created', 
      group: { id: result.insertId, name, trainer_id, hall, schedule_day, schedule_time } 
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

module.exports = router;

