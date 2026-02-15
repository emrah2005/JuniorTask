const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const groupValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('trainer_id').isInt({ min: 1 }).withMessage('Valid trainer required'),
  body('business_id').optional().isInt({ min: 1 }),
  body('description').optional().isString(),
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
    const { name, trainer_id, business_id, description, hall, schedule_day, schedule_time } = req.body;
    const [result] = await req.pool.execute(
      `INSERT INTO groups (name, business_id, description, trainer_id, hall, schedule_day, schedule_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, business_id || null, description || null, trainer_id, hall || null, schedule_day ?? null, schedule_time ?? null]
    );
    res.status(201).json({ 
      message: 'Group created', 
      group: { id: result.insertId, name, business_id, description, trainer_id, hall, schedule_day, schedule_time } 
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

// Create a session (Admin/SuperAdmin)
router.post('/session', authenticateToken, authorizeRoles('Admin','SuperAdmin'), [
  body('group_id').isInt({ min: 1 }),
  body('date').isISO8601(),
  body('start_time').matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('capacity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { group_id, date, start_time, capacity } = req.body;
    const session_datetime = new Date(`${date}T${start_time}:00`);
    if (session_datetime < new Date()) {
      return res.status(400).json({ error: 'Cannot create past session' });
    }
    const [grp] = await req.pool.execute('SELECT id FROM groups WHERE id = ?', [group_id]);
    if (grp.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const [existing] = await req.pool.execute(
      'SELECT id FROM group_sessions WHERE group_id = ? AND session_datetime = ?',
      [group_id, session_datetime]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Session already exists' });
    }
    const [result] = await req.pool.execute(
      'INSERT INTO group_sessions (group_id, session_datetime, capacity, created_by) VALUES (?, ?, ?, ?)',
      [group_id, session_datetime, capacity, req.user.userId]
    );
    res.status(201).json({ message: 'Session created', session: { id: result.insertId, group_id, session_datetime, capacity } });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List sessions with capacity used
router.get('/sessions', authenticateToken, authorizeRoles('Admin','SuperAdmin'), async (req, res) => {
  try {
    const [rows] = await req.pool.execute(`
      SELECT gs.id, gs.group_id, gs.session_datetime, gs.capacity,
             g.name as group_name, u.name as trainer_name,
             (
               SELECT COUNT(*) FROM group_bookings gb
               WHERE gb.group_id = gs.group_id
                 AND gb.session_datetime = gs.session_datetime
                 AND gb.status IN ('pending','confirmed')
             ) as used
      FROM group_sessions gs
      JOIN groups g ON gs.group_id = g.id
      JOIN users u ON g.trainer_id = u.id
      WHERE gs.session_datetime > NOW()
      ORDER BY gs.session_datetime ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Applications for a session
router.get('/session/:id/applications', authenticateToken, authorizeRoles('Admin','SuperAdmin'), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const [sess] = await req.pool.execute('SELECT group_id, session_datetime FROM group_sessions WHERE id = ?', [sessionId]);
    if (sess.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const { group_id, session_datetime } = sess[0];
    const [apps] = await req.pool.execute(`
      SELECT gb.id, gb.user_id, gb.status, u.name as user_name, u.email
      FROM group_bookings gb
      JOIN users u ON gb.user_id = u.id
      WHERE gb.group_id = ? AND gb.session_datetime = ?
      ORDER BY gb.created_at ASC
    `, [group_id, session_datetime]);
    res.json({ applications: apps, group_id, session_datetime });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public available sessions for users
router.get('/available/public', async (req, res) => {
  try {
    const [rows] = await req.pool.execute(`
      SELECT gs.id as session_id, g.id as group_id, g.name as group_name, u.name as trainer_name,
             gs.session_datetime, gs.capacity,
             (
               SELECT COUNT(*) FROM group_bookings gb
               WHERE gb.group_id = gs.group_id
                 AND gb.session_datetime = gs.session_datetime
                 AND gb.status IN ('pending','confirmed')
             ) as used
      FROM group_sessions gs
      JOIN groups g ON gs.group_id = g.id
      JOIN users u ON g.trainer_id = u.id
      WHERE gs.session_datetime > NOW()
      ORDER BY gs.session_datetime ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Public available sessions list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User applies to a session
router.post('/apply', authenticateToken, [
  body('session_id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { session_id } = req.body;
    const [sess] = await req.pool.execute('SELECT group_id, session_datetime, capacity FROM group_sessions WHERE id = ?', [session_id]);
    if (sess.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const { group_id, session_datetime, capacity } = sess[0];
    if (new Date(session_datetime) < new Date()) {
      return res.status(400).json({ error: 'Cannot apply to past session' });
    }
    const [dup] = await req.pool.execute(
      'SELECT id FROM group_bookings WHERE user_id = ? AND group_id = ? AND session_datetime = ?',
      [req.user.userId, group_id, session_datetime]
    );
    if (dup.length > 0) {
      return res.status(409).json({ error: 'Already applied' });
    }
    const [usedCountRows] = await req.pool.execute(
      `SELECT COUNT(*) as used FROM group_bookings 
       WHERE group_id = ? AND session_datetime = ? AND status IN ('pending','confirmed')`,
      [group_id, session_datetime]
    );
    if (usedCountRows[0].used >= capacity) {
      return res.status(400).json({ error: 'Session is full' });
    }
    const [ins] = await req.pool.execute(
      'INSERT INTO group_bookings (user_id, group_id, session_datetime, status) VALUES (?, ?, ?, ?)',
      [req.user.userId, group_id, session_datetime, 'pending']
    );
    res.status(201).json({ message: 'Applied', application: { id: ins.insertId, status: 'pending', session_id } });
  } catch (error) {
    console.error('Error applying to session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject application (Admin/SuperAdmin)
router.post('/session/:id/approve', authenticateToken, authorizeRoles('Admin','SuperAdmin'), [
  body('application_id').isInt({ min: 1 }),
  body('action').isIn(['approve','reject'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const sessionId = parseInt(req.params.id, 10);
    const { application_id, action } = req.body;
    const [sess] = await req.pool.execute('SELECT group_id, session_datetime, capacity FROM group_sessions WHERE id = ?', [sessionId]);
    if (sess.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const { group_id, session_datetime, capacity } = sess[0];
    const [appRows] = await req.pool.execute('SELECT id, user_id, status FROM group_bookings WHERE id = ? AND group_id = ? AND session_datetime = ?', [application_id, group_id, session_datetime]);
    if (appRows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (action === 'approve') {
      const [usedCountRows] = await req.pool.execute(
        `SELECT COUNT(*) as used FROM group_bookings 
         WHERE group_id = ? AND session_datetime = ? AND status = 'confirmed'`,
        [group_id, session_datetime]
      );
      if (usedCountRows[0].used >= capacity) {
        return res.status(400).json({ error: 'Capacity reached' });
      }
      await req.pool.execute('UPDATE group_bookings SET status = \'confirmed\' WHERE id = ?', [application_id]);
      return res.json({ message: 'Approved', application_id, status: 'confirmed' });
    } else {
      await req.pool.execute('UPDATE group_bookings SET status = \'cancelled\' WHERE id = ?', [application_id]);
      return res.json({ message: 'Rejected', application_id, status: 'cancelled' });
    }
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark attendance (Admin/SuperAdmin)
router.post('/session/:id/attendance', authenticateToken, authorizeRoles('Admin','SuperAdmin'), [
  body('application_id').isInt({ min: 1 }),
  body('present').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const sessionId = parseInt(req.params.id, 10);
    const { application_id, present } = req.body;
    const [sess] = await req.pool.execute('SELECT group_id, session_datetime FROM group_sessions WHERE id = ?', [sessionId]);
    if (sess.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const { group_id, session_datetime } = sess[0];
    const [appRows] = await req.pool.execute('SELECT id, user_id FROM group_bookings WHERE id = ? AND group_id = ? AND session_datetime = ?', [application_id, group_id, session_datetime]);
    if (appRows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const user_id = appRows[0].user_id;
    if (present) {
      try {
        await req.pool.execute(
          `INSERT INTO attendance (user_id, group_id, session_datetime, source) VALUES (?, ?, ?, 'coach')`,
          [user_id, group_id, session_datetime]
        );
      } catch (_) {}
      return res.json({ message: 'Attendance marked', application_id, user_id, present: true });
    } else {
      await req.pool.execute(
        `DELETE FROM attendance WHERE user_id = ? AND group_id = ? AND session_datetime = ?`,
        [user_id, group_id, session_datetime]
      );
      return res.json({ message: 'Attendance removed', application_id, user_id, present: false });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
