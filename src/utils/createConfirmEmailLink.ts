import { v4 } from "uuid"
import { Redis } from "ioredis";

export const createConfirmEmailLink = async (baseUrl: string, userId: string, redis: Redis) => {
  const id = v4();
  await redis.set(id, userId, "ex", 60 * 60 * 24)

  return `${baseUrl}/confirm/${id}`
}