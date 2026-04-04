import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 3000);
    },
});

redis.on('connect', () => console.log('✅ Redis terhubung'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

export default redis;