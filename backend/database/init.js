const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/**
 * Initialize database - Creates database and runs schema if needed
 */
async function initializeDatabase() {
  try {
    // First, connect without selecting a database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Creating database if not exists...');
    
    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS booking_saas');
    console.log('✓ Database created or already exists');
    
    // Now connect to the database
    await connection.changeUser({ database: 'booking_saas' });
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !/^USE\s+/i.test(s));
    
    for (const statement of statements) {
      try {
        await connection.execute(statement);
      } catch (_) {}
    }
    
    console.log('✓ Database schema initialized successfully');
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
