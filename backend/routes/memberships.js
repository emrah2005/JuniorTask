const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const membershipValidation = [
  body('user_id').isInt({ min: 1 }).withMessage('Valid user required'),
  body('group_id').isInt({ min: 1 }).withMessage('Valid group required'),
  body('status').optional().isIn(['active','paused','expired']),
  body('valid_from').optional().isDate(),
  body('valid_to').optional().isDate(),
  body('allowed_entries').optional().isInt({ min: 1 })
];

router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await req.pool.execute(
      `SELECT m.*, u.name as user_name, u.email as user_email
       FROM memberships m JOIN users u ON m.user_id = u.id
       WHERE m.group_id = ? AND m.status = 'active'`,
      [req.params.groupId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('Admin','SuperAdmin'), membershipValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { user_id, group_id, status = 'active', valid_from, valid_to, allowed_entries } = req.body;
    const [result] = await req.pool.execute(
      `INSERT INTO memberships (user_id, group_id, status, valid_from, valid_to, allowed_entries)
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE status=VALUES(status), valid_from=VALUES(valid_from), valid_to=VALUES(valid_to), allowed_entries=VALUES(allowed_entries)`,
      [user_id, group_id, status, valid_from || null, valid_to || null, allowed_entries || null]
    );
    res.status(201).json({ message: 'Membership upserted', id: result.insertId || null });
  } catch (error) {
    console.error('Error upserting membership:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

