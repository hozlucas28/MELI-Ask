import { createClient } from "redis"
import { REDIS_URL } from "#src/env"
import { logger } from "#shared/logger"

const redis = createClient({ url: REDIS_URL })

redis.on("error", error => logger.error({ error }, "Redis client error"))

async function connectRedis(): Promise<void> {
    if (redis.isOpen) return

    await redis.connect()
}

async function closeRedis(): Promise<void> {
    if (!redis.isOpen) return

    await redis.quit()
}

export { closeRedis, connectRedis, redis }
