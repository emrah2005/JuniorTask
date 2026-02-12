const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const serviceValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Service name must be at least 2 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute')
];

router.get('/business/:businessId', async (req, res) => {
  try {
    const [services] = await req.pool.execute(
      'SELECT * FROM services WHERE business_id = ? ORDER BY name',
      [req.params.businessId]
    );
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [services] = await req.pool.execute(
      'SELECT s.*, b.name as business_name FROM services s JOIN businesses b ON s.business_id = b.id WHERE s.id = ?',
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(services[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), serviceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { business_id, name, price, duration } = req.body;

    const [businesses] = await req.pool.execute(
      'SELECT owner_id FROM businesses WHERE id = ?',
      [business_id]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.role === 'Admin' && businesses[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await req.pool.execute(
      'INSERT INTO services (business_id, name, price, duration) VALUES (?, ?, ?, ?)',
      [business_id, name, price, duration]
    );

    res.status(201).json({
      message: 'Service created successfully',
      service: { id: result.insertId, business_id, name, price, duration }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), serviceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, duration } = req.body;

    const [services] = await req.pool.execute(
      `SELECT s.business_id, b.owner_id 
       FROM services s 
       JOIN businesses b ON s.business_id = b.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (req.user.role === 'Admin' && services[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.pool.execute(
      'UPDATE services SET name = ?, price = ?, duration = ? WHERE id = ?',
      [name, price, duration, req.params.id]
    );

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const [services] = await req.pool.execute(
      `SELECT s.business_id, b.owner_id 
       FROM services s 
       JOIN businesses b ON s.business_id = b.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (req.user.role === 'Admin' && services[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.pool.execute('DELETE FROM services WHERE id = ?', [req.params.id]);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
