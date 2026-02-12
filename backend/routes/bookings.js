const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const bookingValidation = [
  body('business_id').isInt({ min: 1 }).withMessage('Valid business ID required'),
  body('service_id').isInt({ min: 1 }).withMessage('Valid service ID required'),
  body('date').isISO8601().withMessage('Valid date required')
];

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email,
             biz.name as business_name, s.name as service_name, s.price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN businesses biz ON b.business_id = biz.id
      JOIN services s ON b.service_id = s.id
    `;

    if (req.user.role === 'User') {
      query += ' WHERE b.user_id = ?';
      const [bookings] = await req.pool.execute(query, [req.user.userId]);
      return res.json(bookings);
    } else if (req.user.role === 'Admin') {
      query += ` WHERE b.business_id IN (
        SELECT id FROM businesses WHERE owner_id = ?
      )`;
      const [bookings] = await req.pool.execute(query, [req.user.userId]);
      return res.json(bookings);
    }

    const [bookings] = await req.pool.execute(query);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/business/:id', authenticateToken, async (req, res) => {
  try {
    const [business] = await req.pool.execute(
      'SELECT owner_id FROM businesses WHERE id = ?',
      [req.params.id]
    );

    if (business.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.role === 'Admin' && business[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [bookings] = await req.pool.execute(
      `SELECT b.id, b.date, b.status, s.name as service_name, s.price as service_price, s.duration as service_duration, u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.user_id = u.id
       WHERE b.business_id = ? AND b.status = 'accepted'
       ORDER BY b.date`,
      [req.params.id]
    );

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching business bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await req.pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email,
              biz.name as business_name, s.name as service_name, s.price
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN businesses biz ON b.business_id = biz.id
       JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];

    if (req.user.role === 'User' && booking.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'Admin') {
      const [business] = await req.pool.execute(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [booking.business_id]
      );
      if (business.length > 0 && business[0].owner_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('User'), bookingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { business_id, service_id, date } = req.body;

    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    const [existingBookings] = await req.pool.execute(
      `SELECT id FROM bookings 
       WHERE business_id = ? AND date = ? AND status IN ('pending', 'accepted')`,
      [business_id, bookingDate]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const [result] = await req.pool.execute(
      'INSERT INTO bookings (user_id, business_id, service_id, date) VALUES (?, ?, ?, ?)',
      [req.user.userId, business_id, service_id, bookingDate]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: { id: result.insertId, user_id: req.user.userId, business_id, service_id, date: bookingDate, status: 'pending' }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [bookings] = await req.pool.execute(
      `SELECT b.business_id, b.date 
       FROM bookings b 
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];

    if (req.user.role === 'Admin') {
      const [business] = await req.pool.execute(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [booking.business_id]
      );
      if (business.length > 0 && business[0].owner_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    if (status === 'accepted') {
      const [existingBookings] = await req.pool.execute(
        `SELECT id FROM bookings 
         WHERE business_id = ? AND date = ? AND status = 'accepted' AND id != ?`,
        [booking.business_id, booking.date, req.params.id]
      );

      if (existingBookings.length > 0) {
        return res.status(400).json({ error: 'Time slot already booked' });
      }
    }

    await req.pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('User'), async (req, res) => {
  try {
    const [bookings] = await req.pool.execute(
      'SELECT user_id, status FROM bookings WHERE id = ?',
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];

    if (booking.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending bookings' });
    }

    await req.pool.execute('DELETE FROM bookings WHERE id = ?', [req.params.id]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
