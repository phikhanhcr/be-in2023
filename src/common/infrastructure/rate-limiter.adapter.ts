import { IRateLimiterOptions, IRateLimiterStoreOptions, RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import { Redis } from 'ioredis';

export class RateLimiterAdapter {
    static redisClient: Redis;

    static async getClient(opts: IRateLimiterOptions): Promise<RateLimiterRedis> {
        if (!RateLimiterAdapter.redisClient) {
            RateLimiterAdapter.redisClient = await RedisAdapter.connect(false, { enableOfflineQueue: false });
        }
        // const test = await RedisAdapter.connect(false, { enableOfflineQueue: false });
        // console.log(test.status, typeof test);
        const defaultOptions: IRateLimiterStoreOptions = {
            // Basic options
            storeClient: RateLimiterAdapter.redisClient,
            // storeClient: test,
            points: 1, // Number of points
            duration: 60, // Per second(s)

            // Custom
            execEvenly: false, // Do not delay actions evenly
            blockDuration: 0, // Do not block if consumed more than points
            keyPrefix: `rate_limiter`, // must be unique for limiters with different purpose
        };
        return new RateLimiterRedis({ ...defaultOptions, ...opts });
    }
}
