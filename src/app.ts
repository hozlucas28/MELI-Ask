import compression from "compression"
import express from "express"
import helmet from "helmet"
import { httpLogger } from "#shared/logger"
import { createV1Router } from "#v1/routes/index"

import type { Express } from "express"
import type { Pool } from "pg"

function createApp(database: Pool): Express {
    const api = express()
    const v1Router = createV1Router(database)

    api.use(httpLogger)
    api.use(helmet())
    api.use(compression())
    api.use(express.json())
    api.get("/health", (_req, res) => res.json({ status: "ok" }))
    api.use("/api/v1", v1Router)

    return api
}

export { createApp }
