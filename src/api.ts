import compression from "compression"
import express from "express"
import helmet from "helmet"
import { v1Router } from "./v1/routes/index.ts"
import { API_PORT } from "./env.ts"
import { httpLogger, logger } from "./shared/logger.ts"
import { errorHandler } from "./v1/middlewares/error-handler.middleware.ts"

import type { Express } from "express"

const api: Express = express()

// Middlewares
api.use(httpLogger)
api.use(helmet())
api.use(compression())
api.use(express.json())
api.use("/api/v1", v1Router)

api.listen(API_PORT, () => logger.info({ port: API_PORT }, "Server listening"))
