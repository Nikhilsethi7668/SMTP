import { createClient } from 'redis';

// Use REDIS_URL from environment if available, otherwise default to local Redis
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis error:', err));

await redisClient.connect();

// Optional: test connection
const pong = await redisClient.ping();
console.log('Redis PING response:', pong); 
