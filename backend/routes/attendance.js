const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const selfCheckValidation = [
  body('group_id').isInt({ min: 1 }).withMessage('Valid group required'),
  body('session_datetime').isISO8601().withMessage('Valid session datetime required')
];

const coachCheckValidation = [
  body('group_id').isInt({ min: 1 }).withMessage('Valid group required'),
  body('session_datetime').isISO8601().withMessage('Valid session datetime required'),
  body('user_ids').isArray({ min: 1 }).withMessage('user_ids array required')
];

const isWithinWindow = (sessionDate, now) => {
  const windowMinutes = 20;
  const startWindow = new Date(sessionDate.getTime() - windowMinutes * 60000);
  const endWindow = new Date(sessionDate.getTime() + windowMinutes * 60000);
  return now >= startWindow && now <= endWindow;
};

const hasActiveMembership = async (pool, userId, groupId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM memberships 
     WHERE user_id = ? AND group_id = ? AND status = 'active'
       AND (valid_from IS NULL OR valid_from <= CURDATE())
       AND (valid_to IS NULL OR valid_to >= CURDATE())`,
    [userId, groupId]
  );
  return rows.length > 0 ? rows[0] : null;
};

const hasOverlap = async (pool, userId, sessionDate) => {
  const [rows] = await pool.execute(
    `SELECT id FROM attendance 
     WHERE user_id = ? AND ABS(TIMESTAMPDIFF(MINUTE, session_datetime, ?)) <= 20`,
    [userId, sessionDate]
  );
  return rows.length > 0;
};

router.post('/self', authenticateToken, authorizeRoles('User'), selfCheckValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { group_id, session_datetime } = req.body;
    const sessionDate = new Date(session_datetime);
    const now = new Date();

    if (!isWithinWindow(sessionDate, now)) {
      return res.status(400).json({ error: 'Check-in not allowed outside time window' });
    }

    const membership = await hasActiveMembership(req.pool, req.user.userId, group_id);
    if (!membership) {
      return res.status(403).json({ error: 'Active membership required' });
    }

    if (await hasOverlap(req.pool, req.user.userId, sessionDate)) {
      return res.status(400).json({ error: 'Already checked in or overlapping session' });
    }

    await req.pool.execute(
      `INSERT INTO attendance (user_id, group_id, session_datetime, source) 
       VALUES (?, ?, ?, 'self')`,
      [req.user.userId, group_id, sessionDate]
    );

    if (membership.allowed_entries && membership.allowed_entries > 0) {
      await req.pool.execute(
        `UPDATE memberships SET used_entries = used_entries + 1 
         WHERE id = ? AND used_entries < allowed_entries`,
        [membership.id]
      );
    }

    res.status(201).json({ message: 'Checked in successfully' });
  } catch (error) {
    console.error('Self check-in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/coach', authenticateToken, authorizeRoles('Admin','SuperAdmin'), coachCheckValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { group_id, session_datetime, user_ids } = req.body;
    const sessionDate = new Date(session_datetime);

    const [groups] = await req.pool.execute('SELECT trainer_id FROM groups WHERE id = ?', [group_id]);
    if (groups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (req.user.role === 'Admin' && groups[0].trainer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = [];
    for (const uid of user_ids) {
      const membership = await hasActiveMembership(req.pool, uid, group_id);
      if (!membership) {
        results.push({ user_id: uid, status: 'skipped', reason: 'no_membership' });
        continue;
      }
      if (await hasOverlap(req.pool, uid, sessionDate)) {
        results.push({ user_id: uid, status: 'skipped', reason: 'overlap' });
        continue;
      }
      await req.pool.execute(
        `INSERT INTO attendance (user_id, group_id, session_datetime, source) 
         VALUES (?, ?, ?, 'coach')`,
        [uid, group_id, sessionDate]
      );
      if (membership.allowed_entries && membership.allowed_entries > 0) {
        await req.pool.execute(
          `UPDATE memberships SET used_entries = used_entries + 1 
           WHERE id = ? AND used_entries < allowed_entries`,
          [membership.id]
        );
      }
      results.push({ user_id: uid, status: 'ok' });
    }
    res.json({ message: 'Coach check-in processed', results });
  } catch (error) {
    console.error('Coach check-in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/session', authenticateToken, async (req, res) => {
  try {
    const { group_id, session_datetime } = req.query;
    if (!group_id || !session_datetime) {
      return res.status(400).json({ error: 'group_id and session_datetime required' });
    }
    const [rows] = await req.pool.execute(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM attendance a JOIN users u ON a.user_id = u.id
       WHERE a.group_id = ? AND a.session_datetime = ?`,
      [group_id, new Date(session_datetime)]
    );
    res.json(rows);
  } catch (error) {
    console.error('Session attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary', authenticateToken, authorizeRoles('Admin','SuperAdmin'), async (req, res) => {
  try {
    const { group_id, from, to } = req.query;
    const params = [];
    let where = '1=1';
    if (group_id) {
      where += ' AND a.group_id = ?';
      params.push(Number(group_id));
    }
    if (from) {
      where += ' AND a.session_datetime >= ?';
      params.push(new Date(from));
    }
    if (to) {
      where += ' AND a.session_datetime <= ?';
      params.push(new Date(to));
    }
    const [rows] = await req.pool.execute(
      `SELECT DATE(a.session_datetime) as day, COUNT(*) as count
       FROM attendance a
       WHERE ${where}
       GROUP BY DATE(a.session_datetime)
       ORDER BY day DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error('Summary attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/list', authenticateToken, authorizeRoles('Admin','SuperAdmin'), async (req, res) => {
  try {
    const { group_id, from, to } = req.query;
    const params = [];
    let where = '1=1';
    if (group_id) {
      where += ' AND a.group_id = ?';
      params.push(Number(group_id));
    }
    if (from) {
      where += ' AND a.session_datetime >= ?';
      params.push(new Date(from));
    }
    if (to) {
      where += ' AND a.session_datetime <= ?';
      params.push(new Date(to));
    }
    const [rows] = await req.pool.execute(
      `SELECT a.*, u.name as user_name, u.email as user_email, g.name as group_name
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       JOIN groups g ON a.group_id = g.id
       WHERE ${where}
       ORDER BY a.session_datetime DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error('List attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
