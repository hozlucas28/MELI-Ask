import compression from "compression"
import express from "express"
import helmet from "helmet"
import * as Sentry from "@sentry/node"
import { httpLogger } from "#shared/logger"
import { errorHandler } from "#v1/middlewares/error-handler.middleware"
import { createV1Router } from "#v1/routes/index"

import type { Express } from "express"
import type { Pool } from "pg"
import type { RedisClientType } from "redis"

type CreateAppInput = {
    database: Pool
    redis: RedisClientType
}

function createApp(input: CreateAppInput): Express {
    const api = express()
    const v1Router = createV1Router(input)

    api.use(httpLogger)
    api.use(helmet())
    api.use(compression())
    api.use(express.json())
    api.get("/health", (_req, res) => res.json({ status: "ok" }))
    api.use("/api/v1", v1Router)
    Sentry.setupExpressErrorHandler(api)
    api.use(errorHandler)

    return api
}

export { createApp }
