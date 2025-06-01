const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('../utils/logger');

// Create connection pool
console.log(config.database.host, config.database.user, config.database.password, config.database.database);
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0,
  // acquireTimeout: 60000,
  multipleStatements: true
});

// Initialize database tables
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // URLs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS urls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        short_key VARCHAR(20) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        click_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        user_id VARCHAR(100) NULL,
        INDEX idx_short_key (short_key),
        INDEX idx_created_at (created_at),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB
    `);

    // Analytics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS url_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        short_key VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referer TEXT,
        country VARCHAR(2),
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_short_key (short_key),
        INDEX idx_clicked_at (clicked_at),
        FOREIGN KEY (short_key) REFERENCES urls(short_key) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    connection.release();
    logger.info('✅ Database tables initialized successfully');
  } catch (error) {
    logger.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase };