import compression from "compression"
import express from "express"
import helmet from "helmet"
import { API_PORT } from "#src/env"
import { httpLogger, logger } from "#shared/logger"
import { v1Router } from "#v1/routes/index"

import type { Express } from "express"

const api: Express = express()

// Middlewares
api.use(httpLogger)
api.use(helmet())
api.use(compression())
api.use(express.json())
api.use("/api/v1", v1Router)

api.listen(API_PORT, () => logger.info({ port: API_PORT }, "Server listening"))
