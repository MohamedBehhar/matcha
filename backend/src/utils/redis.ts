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
  time: number
): Promise<void> => {
  try {
    await redisClient?.set(key, value, "EX", time); // No need for callback
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

export const addSocketIdToRedis = async (userId: string, socketId: string) => {
  try {
    await redisClient.sadd(`userSockets:${userId}`, socketId); // Use a Set
    await redisClient.set(`socket:${socketId}`, userId);       // Keep socket → user mapping as string
  } catch (err) {
    throw new Error(`Error setting key in Redis: ${err}`);
  }
};


export const getSocketIdsByUserId = async (userId: string) => {
  try {
    return await redisClient.smembers(`userSockets:${userId}`); // Returns an array of socket IDs
  } catch (err) {
    throw new Error(`Error getting socket IDs for user: ${err}`);
  }
};


export const getUserIdBySocketId = async (socketId: string) => {
  try {
    return await redisClient.get(`socket:${socketId}`);
  } catch (err) {
    throw new Error(`Error getting userId for socket: ${err}`);
  }
};

export const getAllSocketIdsWithUserIds = async () => {
  try {
    const keys = await redisClient.keys("socket:*");
    const socketIdsWithUserIds: Record<string, string> = {};
    for (const key of keys) {
      const userId = await redisClient.get(key);
      if (userId) {
        socketIdsWithUserIds[key] = userId;
      }
    }
    return socketIdsWithUserIds;
  } catch (err) {
    throw new Error(`Error getting all socket IDs with user IDs: ${err}`);
  }
}

export const deleteSocketIdFromRedis = async (socketId: string) => {
  try {
    const userId = await redisClient.get(`socket:${socketId}`);
    if (userId) {
      await redisClient.srem(`userSockets:${userId}`, socketId); // Remove this socket from the user's set
    }
    await redisClient.del(`socket:${socketId}`);
  } catch (err) {
    throw new Error(`Error deleting socket and user keys from Redis: ${err}`);
  }
};


export default redisClient;
