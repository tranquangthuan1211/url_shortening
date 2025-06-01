const { pool } = require('../config/database');
class AnalyticsModel {
  static async recordClick(analyticsData) {
    const { shortKey, ipAddress, userAgent, referer, country } = analyticsData;
    
    await pool.execute(
      'INSERT INTO url_analytics (short_key, ip_address, user_agent, referer, country) VALUES (?, ?, ?, ?, ?)',
      [shortKey, ipAddress, userAgent, referer, country]
    );
  }

  static async getUrlStats(shortKey) {
    // Get URL basic info
    const [urlInfo] = await pool.execute(
      'SELECT original_url, created_at, expires_at, click_count, is_active FROM urls WHERE short_key = ?',
      [shortKey]
    );

    if (urlInfo.length === 0) {
      return null;
    }

    // Get daily stats for last 30 days
    const [dailyStats] = await pool.execute(`
      SELECT 
        DATE(clicked_at) as date, 
        COUNT(*) as clicks 
      FROM url_analytics 
      WHERE short_key = ? 
        AND clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(clicked_at) 
      ORDER BY date DESC
    `, [shortKey]);

    // Get recent clicks
    const [recentClicks] = await pool.execute(`
      SELECT ip_address, user_agent, referer, clicked_at 
      FROM url_analytics 
      WHERE short_key = ? 
      ORDER BY clicked_at DESC 
      LIMIT 10
    `, [shortKey]);

    // Get top referrers
    const [topReferrers] = await pool.execute(`
      SELECT referer, COUNT(*) as count 
      FROM url_analytics 
      WHERE short_key = ? AND referer IS NOT NULL 
      GROUP BY referer 
      ORDER BY count DESC 
      LIMIT 5
    `, [shortKey]);

    return {
      ...urlInfo[0],
      dailyStats,
      recentClicks,
      topReferrers
    };
  }
}

module.exports = AnalyticsModel;