const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/monthly-revenue/:businessId', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const businessId = req.params.businessId;

    if (req.user.role === 'Admin') {
      const [business] = await req.pool.execute(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [businessId]
      );
      if (business.length === 0 || business[0].owner_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const [monthlyRevenue] = await req.pool.execute(`
      SELECT DATE_FORMAT(b.date, '%Y-%m') as month, SUM(s.price) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id = ? AND b.status = 'accepted'
      GROUP BY DATE_FORMAT(b.date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [businessId]);

    res.json(monthlyRevenue.reverse());
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/revenue-per-service/:businessId', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const businessId = req.params.businessId;

    if (req.user.role === 'Admin') {
      const [business] = await req.pool.execute(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [businessId]
      );
      if (business.length === 0 || business[0].owner_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const [revenuePerService] = await req.pool.execute(`
      SELECT s.name, SUM(s.price) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id = ? AND b.status = 'accepted'
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
    `, [businessId]);

    res.json(revenuePerService);
  } catch (error) {
    console.error('Error fetching revenue per service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bookings-per-month/:businessId', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const businessId = req.params.businessId;

    if (req.user.role === 'Admin') {
      const [business] = await req.pool.execute(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [businessId]
      );
      if (business.length === 0 || business[0].owner_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const [bookingsPerMonth] = await req.pool.execute(`
      SELECT DATE_FORMAT(b.date, '%Y-%m') as month, COUNT(*) as bookings
      FROM bookings b
      WHERE b.business_id = ? AND b.status = 'accepted'
      GROUP BY DATE_FORMAT(b.date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [businessId]);

    res.json(bookingsPerMonth.reverse());
  } catch (error) {
    console.error('Error fetching bookings per month:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
