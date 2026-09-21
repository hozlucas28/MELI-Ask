import { createApp } from "#src/app"
import { APP_PORT } from "#src/env"
import { database } from "#shared/database"
import { logger } from "#shared/logger"
import { initializeV1Database } from "#v1/database/initialize"

async function startApi() {
    await initializeV1Database(database)

    const api = createApp(database)

    api.listen(APP_PORT, () => logger.info({ port: APP_PORT }, "Server listening"))
}

startApi().catch(async error => {
    logger.fatal({ error }, "unable to start server")
    await database.end()
    process.exitCode = 1
})
