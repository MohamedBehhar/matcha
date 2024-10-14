import * as redis from 'redis';



const redisClient = redis.createClient({
    url: "redis://localhost:6379",
});


redisClient.on('connect', () => {
    console.log('Redis client connected');
});


redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

export const setKey = async (key: string, value: string): Promise<void> => {
    try {
        await redisClient?.set(key, value);  // No need for callback
    } catch (err) {
        throw new Error(`Error setting key in Redis: ${err}`);
    }
};

export const getKey = async (key: string): Promise<string | null> => {
    try{
        return await redisClient?.get(key);
    }
    catch (err) {
        throw new Error(`Error getting key from Redis: ${err}`);
    }
};

export const deleteKey = async (key: string): Promise<void> => {
    try {
        await redisClient?.del(key);
    } catch (err) {
        throw new Error(`Error deleting key from Redis: ${err}`);
    }
};

export default redisClient;
