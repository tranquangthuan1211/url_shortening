const { pool } = require('../config/database');

class UrlModel {
  static async create(urlData) {
    const { shortKey, originalUrl, expiresAt, userId } = urlData;
    
    const [result] = await pool.execute(
      'INSERT INTO urls (short_key, original_url, expires_at, user_id) VALUES (?, ?, ?, ?)',
      [shortKey, originalUrl, expiresAt, userId]
    );
    
    return result.insertId;
  }

  static async findByShortKey(shortKey) {
    const [rows] = await pool.execute(
      'SELECT * FROM urls WHERE short_key = ? AND is_active = TRUE',
      [shortKey]
    );
    
    return rows[0] || null;
  }

  static async updateClickCount(shortKey) {
    await pool.execute(
      'UPDATE urls SET click_count = click_count + 1 WHERE short_key = ?',
      [shortKey]
    );
  }

  static async deactivate(shortKey) {
    const [result] = await pool.execute(
      'UPDATE urls SET is_active = FALSE WHERE short_key = ?',
      [shortKey]
    );
    
    return result.affectedRows > 0;
  }

  static async findExpired() {
    const [rows] = await pool.execute(
      'SELECT short_key FROM urls WHERE expires_at < NOW() AND is_active = TRUE'
    );
    
    return rows;
  }

  static async deactivateExpired() {
    const [result] = await pool.execute(
      'UPDATE urls SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE'
    );
    
    return result.affectedRows;
  }

  static async checkKeyExists(shortKey) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM urls WHERE short_key = ?',
      [shortKey]
    );
    
    return rows.length > 0;
  }
}

module.exports = UrlModel;