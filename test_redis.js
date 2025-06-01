const express = require('express');
const { getRedisClient } = require('./src/config/redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/check-redis', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return res.status(500).json({ status: 'fail', message: 'Redis not initialized' });
    }

    const pong = await redisClient.ping();
    res.status(200).json({ status: 'success', message: pong });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Redis error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
