import * as redis from "ioredis";
import env from "./env";

const redisClient = new redis.Redis(env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.log(`Error connecting to Redis: ${err}`);
});

redisClient.on("end", () => {
  console.log("Disconnected from Redis");
});

redisClient.on("reconnecting", () => {
  console.log("Reconnecting to Redis");
});

export const setKey = async (
  key: string,
  value: string,
  expiredTime: number
): Promise<void> => {
  try {
    await redisClient?.set(key, value, "EX", expiredTime);
  } catch (err) {
    throw new Error(`Error setting key in Redis: ${err}`);
  }
};

export const getKey = async (key: string): Promise<string | null> => {
  try {
    return await redisClient?.get(key);
  } catch (err) {
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
