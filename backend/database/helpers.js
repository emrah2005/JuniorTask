/**
 * Database Helper Functions
 * Common query utilities and database operations
 */

/**
 * Check if user exists by email
 */
async function getUserByEmail(pool, email) {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(pool, userId) {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

/**
 * Get all businesses for a user
 */
async function getUserBusinesses(pool, userId) {
  try {
    const [businesses] = await pool.execute(
      'SELECT * FROM businesses WHERE owner_id = ?',
      [userId]
    );
    return businesses;
  } catch (error) {
    console.error('Error fetching user businesses:', error);
    throw error;
  }
}

/**
 * Get business by ID
 */
async function getBusinessById(pool, businessId) {
  try {
    const [businesses] = await pool.execute(
      'SELECT * FROM businesses WHERE id = ?',
      [businessId]
    );
    return businesses.length > 0 ? businesses[0] : null;
  } catch (error) {
    console.error('Error fetching business:', error);
    throw error;
  }
}

/**
 * Get services for a business
 */
async function getBusinessServices(pool, businessId) {
  try {
    const [services] = await pool.execute(
      'SELECT * FROM services WHERE business_id = ? ORDER BY name',
      [businessId]
    );
    return services;
  } catch (error) {
    console.error('Error fetching business services:', error);
    throw error;
  }
}

/**
 * Get bookings for a user
 */
async function getUserBookings(pool, userId) {
  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, s.name as service_name, bn.name as business_name 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       JOIN businesses bn ON b.business_id = bn.id 
       WHERE b.user_id = ? 
       ORDER BY b.date DESC`,
      [userId]
    );
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Get bookings for a business
 */
async function getBusinessBookings(pool, businessId) {
  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, s.name as service_name
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN services s ON b.service_id = s.id 
       WHERE b.business_id = ? 
       ORDER BY b.date DESC`,
      [businessId]
    );
    return bookings;
  } catch (error) {
    console.error('Error fetching business bookings:', error);
    throw error;
  }
}

/**
 * Get user groups/memberships
 */
async function getUserMemberships(pool, userId) {
  try {
    const [memberships] = await pool.execute(
      `SELECT m.*, g.name as group_name, g.schedule_time, u.name as trainer_name
       FROM memberships m 
       JOIN groups g ON m.group_id = g.id 
       JOIN users u ON g.trainer_id = u.id 
       WHERE m.user_id = ?`,
      [userId]
    );
    return memberships;
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    throw error;
  }
}

/**
 * Check if slot is available
 */
async function isSlotAvailable(pool, businessId, date) {
  try {
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE business_id = ? AND date = ? AND status != "rejected"',
      [businessId, date]
    );
    return bookings.length === 0;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    throw error;
  }
}

/**
 * Transaction helper - Execute multiple queries in a transaction
 */
async function executeTransaction(pool, queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const results = [];
    
    for (const query of queries) {
      const [result] = await connection.execute(query.sql, query.params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    throw error;
  } finally {
    await connection.release();
  }
}

module.exports = {
  getUserByEmail,
  getUserById,
  getUserBusinesses,
  getBusinessById,
  getBusinessServices,
  getUserBookings,
  getBusinessBookings,
  getUserMemberships,
  isSlotAvailable,
  executeTransaction
};
