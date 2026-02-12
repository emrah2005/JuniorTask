const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/superadmin', authenticateToken, authorizeRoles('SuperAdmin'), async (req, res) => {
  try {
    const [totalUsers] = await req.pool.execute('SELECT COUNT(*) as count FROM users');
    const [totalBusinesses] = await req.pool.execute('SELECT COUNT(*) as count FROM businesses');
    const [totalBookings] = await req.pool.execute('SELECT COUNT(*) as count FROM bookings');
    const [acceptedBookings] = await req.pool.execute('SELECT COUNT(*) as count FROM bookings WHERE status = "accepted"');
    
    const [revenueResult] = await req.pool.execute(`
      SELECT SUM(s.price) as total_revenue 
      FROM bookings b 
      JOIN services s ON b.service_id = s.id 
      WHERE b.status = 'accepted'
    `);

    const [monthlyRevenue] = await req.pool.execute(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(s.price) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status = 'accepted'
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    const [monthlyBookings] = await req.pool.execute(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as bookings
      FROM bookings
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalBusinesses: totalBusinesses[0].count,
        totalBookings: totalBookings[0].count,
        acceptedBookings: acceptedBookings[0].count,
        totalRevenue: revenueResult[0].total_revenue || 0
      },
      charts: {
        monthlyRevenue: monthlyRevenue.reverse(),
        monthlyBookings: monthlyBookings.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching superadmin dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [businesses] = await req.pool.execute(
      'SELECT id FROM businesses WHERE owner_id = ?',
      [req.user.userId]
    );

    if (businesses.length === 0) {
      return res.json({
        stats: {
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalBookings: 0,
          acceptedBookings: 0
        },
        charts: {
          revenuePerService: [],
          bookingsPerMonth: []
        }
      });
    }

    const businessIds = businesses.map(b => b.id);

    const [totalBookings] = await req.pool.execute(
      `SELECT COUNT(*) as count FROM bookings WHERE business_id IN (${businessIds.join(',')})`
    );
    
    const [acceptedBookings] = await req.pool.execute(
      `SELECT COUNT(*) as count FROM bookings WHERE business_id IN (${businessIds.join(',')}) AND status = 'accepted'`
    );

    const [revenueResult] = await req.pool.execute(`
      SELECT SUM(s.price) as total_revenue 
      FROM bookings b 
      JOIN services s ON b.service_id = s.id 
      WHERE b.business_id IN (${businessIds.join(',')}) AND b.status = 'accepted'
    `);

    const [monthlyRevenueResult] = await req.pool.execute(`
      SELECT SUM(s.price) as monthly_revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id IN (${businessIds.join(',')}) 
        AND b.status = 'accepted'
        AND DATE_FORMAT(b.date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
    `);

    const [revenuePerService] = await req.pool.execute(`
      SELECT s.name, SUM(s.price) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id IN (${businessIds.join(',')}) AND b.status = 'accepted'
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
    `);

    const [bookingsPerMonth] = await req.pool.execute(`
      SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as bookings
      FROM bookings
      WHERE business_id IN (${businessIds.join(',')})
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      stats: {
        totalRevenue: revenueResult[0].total_revenue || 0,
        monthlyRevenue: monthlyRevenueResult[0].monthly_revenue || 0,
        totalBookings: totalBookings[0].count,
        acceptedBookings: acceptedBookings[0].count
      },
      charts: {
        revenuePerService,
        bookingsPerMonth: bookingsPerMonth.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user', authenticateToken, authorizeRoles('User'), async (req, res) => {
  try {
    const [myBookings] = await req.pool.execute(
      `SELECT b.*, biz.name as business_name, s.name as service_name, s.price
       FROM bookings b
       JOIN businesses biz ON b.business_id = biz.id
       JOIN services s ON b.service_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.date DESC`,
      [req.user.userId]
    );

    res.json({
      bookings: myBookings
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
