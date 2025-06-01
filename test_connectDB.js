const { pool } = require('./src/config/database'); // sửa lại path nếu cần
const logger = require('./src/utils/logger'); // sửa lại path nếu logger nằm chỗ khác

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    connection.release();
    logger.info('✅ Database connection successful:', rows[0]);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
