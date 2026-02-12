# Database Setup Guide

This document explains how the database is configured and set up for the Booking SaaS application.

## Overview

The application uses **MySQL** as its database management system with a Node.js connection pool for efficient connection management.

### Database Files

- **schema.sql** - Defines all tables, columns, and relationships
- **init.js** - Initializes the database on first run
- **helpers.js** - Utility functions for common database operations

## Environment Variables

Create a `.env` file based on `.env.example` in the backend root directory:

```bash
cp .env.example .env
```

### Required Configuration

```
DB_HOST=localhost              # MySQL server hostname
DB_USER=root                   # Database user
DB_PASSWORD=your_password      # Database password (use strong password in production)
DB_NAME=booking_saas           # Database name
PORT=5000                      # Server port
JWT_SECRET=your_secret_key     # JWT token secret (change in production!)
NODE_ENV=development           # Environment mode
```

## Database Schema

The application supports multiple business types:

### Core Tables

1. **users** - User accounts and authentication
   - SuperAdmin, Admin, and User roles
   - Email and password authentication
   
2. **businesses** - Business/Service provider profiles
   - Owned by users
   - Types: Barber, Gym, Training Hall, Car Wash

3. **services** - Services offered by a business
   - Name, price, duration
   - Optional schedule information

4. **bookings** - Customer bookings/reservations
   - Status tracking (pending, accepted, rejected)
   - Links users to services
   - Timestamp tracking

5. **groups** - Training groups/classes (for gyms/training halls)
   - Trainer assignment
   - Schedule management
   - Pricing

6. **memberships** - User membership in groups
   - Status tracking (active, paused, expired)
   - Validity dates
   - Entry limits

7. **attendance** - Attendance records for group sessions
   - Session tracking
   - Source tracking (self/coach marked)

## Database Initialization

### First Time Setup

When the application starts for the first time:

1. The database connection pool is created
2. Tables are automatically created if they don't exist
3. Default admin user is seeded

### Manual Database Creation

If you need to manually set up the database:

```bash
mysql -u root -p
```

Then run:

```sql
SOURCE backend/database/schema.sql;
```

## Database Helper Functions

The `helpers.js` file provides reusable functions for common operations:

- `getUserByEmail(pool, email)` - Find user by email
- `getUserById(pool, userId)` - Get user profile
- `getUserBusinesses(pool, userId)` - List user's businesses
- `getBusinessServices(pool, businessId)` - List business services
- `getUserBookings(pool, userId)` - Get user's bookings
- `getBusinessBookings(pool, businessId)` - Get all bookings for a business
- `getUserMemberships(pool, userId)` - Get user's group memberships
- `isSlotAvailable(pool, businessId, date)` - Check booking availability
- `executeTransaction(pool, queries)` - Run multiple queries in transaction

### Usage Example

```javascript
const { getUserByEmail } = require('./database/helpers');

const user = await getUserByEmail(pool, 'user@example.com');
```

## Connection Pool Configuration

The application uses `mysql2/promise` with connection pooling:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Pool Options

- **connectionLimit**: 10 - Maximum connections in pool
- **waitForConnections**: true - Queue requests if no connections available
- **queueLimit**: 0 - Unlimited queue size

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection:
   ```javascript
   pool.execute('SELECT * FROM users WHERE email = ?', [email])
   ```

2. **Use helper functions** for common operations instead of writing raw SQL

3. **Handle errors properly** with try/catch blocks

4. **Use transactions** for operations that must succeed together

5. **Never hardcode credentials** - Use environment variables

6. **Regular backups** - Implement backup strategy for production

## Troubleshooting

### Connection Refused
- Ensure MySQL server is running
- Check DB_HOST and DB_USER are correct
- Verify DB_PASSWORD is correct

### Table Already Exists
- The schema.sql uses `CREATE TABLE IF NOT EXISTS`
- Safe to run multiple times
- Existing data is preserved

### Permission Denied
- Database user needs CREATE, INSERT, SELECT, UPDATE, DELETE privileges
- Grant permissions with:
  ```sql
  GRANT ALL PRIVILEGES ON booking_saas.* TO 'username'@'localhost';
  FLUSH PRIVILEGES;
  ```

## Production Considerations

1. **Use managed database service** (AWS RDS, DigitalOcean, etc.)
2. **Enable SSL connections** for secure data transmission
3. **Implement read replicas** for high availability
4. **Set strong passwords** and rotate regularly
5. **Enable query logging** for debugging
6. **Monitor connection pool** usage
7. **Implement automated backups**
8. **Use database-level encryption**
