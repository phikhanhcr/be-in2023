import ioredis, { Redis } from 'ioredis';
import logger from '@common/logger';
import { REDIS_URI } from '@config/environment';
import { QueueOptions } from 'bull';

export interface IRedisZaddParams {
    key: string;
    score: number;
}

/**
 * Singleton Redis client
 */
export class RedisAdapter {
    private static client: Redis;

    private static subscriber: Redis;
    private static allClients: Redis[] = [];

    static async getClient(): Promise<Redis> {
        if (!RedisAdapter.client) {
            await RedisAdapter.connect();
        }
        return RedisAdapter.client;
    }

    static async connect(overrideClient = true, options = {}): Promise<Redis> {
        const tmp = new ioredis(REDIS_URI, {
            lazyConnect: true,
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        tmp.on('ready', () => {
            logger.info('Connect to redis successfully!');
        });
        tmp.on('end', () => {
            logger.info('Connect to redis ended!');
        });

        tmp.on('error', (error) => {
            logger.error('Connect to redis error!', error);
        });

        try {
            await tmp.connect();
        } catch (error) {
            logger.error('Connect to redis error!', error);
            process.exit(1);
        }

        if (overrideClient) {
            RedisAdapter.client = tmp;
        }
        RedisAdapter.allClients.push(tmp);
        return tmp;
    }

    static createClient(options = {}): Redis {
        const tmp = new ioredis(REDIS_URI, {
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        tmp.on('ready', () => {
            logger.info('Connect to redis successfully!');
        });
        tmp.on('end', () => {
            logger.info('Connect to redis ended!');
        });

        tmp.on('error', (error) => {
            logger.error('Connect to redis error!', error);
            process.exit(1);
        });

        RedisAdapter.allClients.push(tmp);

        return tmp;
    }

    static async disconnect(): Promise<void> {
        logger.info('Closing redis connection...');
        try {
            await Promise.all(RedisAdapter.allClients.map((client) => client.quit()));
        } catch (error) {
            logger.error('Closing redis connection error!', error);
        }
    }

    static async getQueueOptions(): Promise<QueueOptions> {
        if (!RedisAdapter.subscriber) {
            RedisAdapter.subscriber = await RedisAdapter.connect(false);
        }
        return {
            prefix: `jobs:`,
            defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: 1000,
            },
            createClient: (type) => {
                switch (type) {
                    case 'client':
                        return RedisAdapter.client;
                    case 'subscriber':
                        return RedisAdapter.subscriber;
                    default:
                        return RedisAdapter.createClient();
                }
            },
        };
    }

    static serialize(value: unknown): string {
        if (value) {
            return JSON.stringify(value);
        }
        return value as string;
    }

    static deserialize(value: unknown): unknown {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        }
        return value;
    }

    static async getOrSet<T>(
        key: string,
        callback: () => Promise<T>,
        ttl: number | ((value: T) => number) = 0,
    ): Promise<T> {
        let value = await RedisAdapter.get(key, true);
        if (value === null) {
            value = await callback();
            let ttlVal: number;
            if (typeof ttl === 'function') {
                ttlVal = ttl(value as T);
            } else {
                ttlVal = ttl as number;
            }
            if (ttlVal > 0) {
                await RedisAdapter.set(key, value, ttlVal, true);
            } else {
                await RedisAdapter.set(key, value, 0, true);
            }
        }
        return value as T;
    }

    static async get(key: string, shouldDeserialize = false): Promise<unknown> {
        const value = await (await RedisAdapter.getClient()).get(key);
        return shouldDeserialize ? RedisAdapter.deserialize(value) : value;
    }

    static async set(key: string, value: unknown, ttl = 0, shouldSerialize = false): Promise<unknown> {
        const stringValue: string = shouldSerialize ? RedisAdapter.serialize(value) : (value as string);
        if (ttl > 0) {
            return (await RedisAdapter.getClient()).set(key, stringValue, 'EX', ttl);
        }
        return (await RedisAdapter.getClient()).set(key, stringValue);
    }

    static async hset(key: string, field: string, value: string): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hset(key, field, value);
            logger.info(`'HSET ${key} ${field} ${value}' to Redis successfully!`);
            return result;
        } catch (error) {
            logger.error(`'HSET ${key} ${field} ${value}' to Redis error!`, error);
        }
    }

    static async hmset(key: string, data: Map<string, string>): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hmset(key, data);
            logger.info(`'HMSET ${key} ${data}' to Redis successfully!`);
            return result;
        } catch (error) {
            logger.error(`'HMSET ${key} ${data}' to Redis error!`, error);
        }
    }

    static async hget(key: string, field: string): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hget(key, field);
            logger.info(`'HGET ${key} ${field}' from Redis successfully!`);
            return result;
        } catch (error) {
            logger.error(`'HGET ${key} ${field}' from Redis error!`, error);
        }
    }

    // static async hmget(key: string, fields: string[]): Promise<unknown> {
    //     try {
    //         const result = await (await RedisAdapter.getClient()).hmget(key, fields);
    //         const data = {};
    //         for (let i = 0; i < fields.length; i++) {
    //             data[fields[i]] = result[i];
    //         }
    //         logger.info(`'HMGET ${key}' from Redis successfully!`);
    //         return data;
    //     } catch (error) {
    //         logger.error(`'HMGET ${key}' from Redis error!`, error);
    //     }
    // }

    static async delete(key: string): Promise<unknown> {
        return (await RedisAdapter.getClient()).del(key);
    }

    static async mget(keys: string[], shouldDeserialize = false): Promise<unknown[]> {
        const values = await (await RedisAdapter.getClient()).mget(keys);
        return shouldDeserialize ? values.map(RedisAdapter.deserialize) : values;
    }

    static async rpush(key: string, value: unknown, shouldSerialize = false): Promise<unknown> {
        const stringValue: string = shouldSerialize ? RedisAdapter.serialize(value) : (value as string);
        return (await RedisAdapter.getClient()).rpush(key, stringValue);
    }

    static async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return (await RedisAdapter.getClient()).lrange(key, start, stop);
    }

    static async keys(key: string): Promise<string[]> {
        return (await RedisAdapter.getClient()).keys(key);
    }

    static async lpop(key: string): Promise<string> {
        return (await RedisAdapter.getClient()).lpop(key);
    }

    static async exists(key: string): Promise<number> {
        return (await RedisAdapter.getClient()).exists(key);
    }

    static async incr(key: string): Promise<number> {
        return (await RedisAdapter.getClient()).incr(key);
    }

    static async expire(key: string, ttl: number): Promise<number> {
        return (await RedisAdapter.getClient()).expire(key, ttl);
    }

    static async incrBy(key: string, numberIncr: number): Promise<number> {
        return (await RedisAdapter.getClient()).incrby(key, numberIncr);
    }

    static async zrange(key: string, start: number, stop: number, withScores: boolean): Promise<string[]> {
        if (withScores) {
            return (await RedisAdapter.getClient()).zrange(key, start, stop, 'WITHSCORES');
        }
        return (await RedisAdapter.getClient()).zrange(key, start, stop);
    }

    static async zadd(key: string, params: IRedisZaddParams[]): Promise<string | number> {
        const paramsArr = [];
        for (const p of params) {
            paramsArr.push([p.score, p.key]);
        }
        return (await RedisAdapter.getClient()).zadd(key, ...paramsArr);
    }

    static async defineCommand(): Promise<void> {
        await Promise.all([]);
    }
}
