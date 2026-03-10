const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
    console.log('Redis Connected');
    return redisClient;
  } catch (error) {
    console.log('Redis not available, using in-memory fallback');
    return null;
  }
};

const getRedis = () => redisClient;

const cache = {
  get: async (key) => {
    try {
      if (!redisClient) return null;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  set: async (key, value, ttl = 3600) => {
    try {
      if (!redisClient) return;
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch { }
  },
  del: async (key) => {
    try {
      if (!redisClient) return;
      await redisClient.del(key);
    } catch { }
  },
  flush: async () => {
    try {
      if (!redisClient) return;
      await redisClient.flushDb();
    } catch { }
  }
};

module.exports = { connectRedis, getRedis, cache };
