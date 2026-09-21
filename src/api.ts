import { createApp } from "#src/app"
import { APP_PORT, SENTRY_DSN } from "#src/env"
import { database } from "#shared/database"
import { logger } from "#shared/logger"
import { closeRedis, connectRedis, redis } from "#shared/redis"
import { initializeV1Database } from "#v1/database/initialize"
import { initializeRagAnswersCache } from "#v1/repositories/rag-answers-cache.repository"
import * as Sentry from "@sentry/node"

async function startApi() {
    await initializeV1Database(database)
    await connectRedis()
    await initializeRagAnswersCache(redis)
    if (!SENTRY_DSN) logger.warn("Sentry is disabled because SENTRY_DSN is not configured")

    const api = createApp({ database, redis })

    const server = api.listen(APP_PORT, () => logger.info({ port: APP_PORT }, "Server listening"))
    const shutdown = async (): Promise<void> => {
        server.close()
        await closeRedis()
        await database.end()
        await Sentry.flush(2_000)
    }

    process.once("SIGINT", () => void shutdown())
    process.once("SIGTERM", () => void shutdown())
}

startApi().catch(async error => {
    logger.fatal({ error }, "unable to start server")
    Sentry.captureException(error)
    await Sentry.flush(2_000)
    await closeRedis()
    await database.end()
    process.exitCode = 1
})
