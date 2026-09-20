import express from "express"
import { v1Router } from "./v1/routes/index.ts"
import { API_PORT } from "./env.ts"
import { httpLogger, logger } from "./shared/logger.ts"
import { errorHandler } from "./v1/middlewares/error-handler.middleware.ts"

import type { Express } from "express"

const api: Express = express()

// Middlewares
api.use(httpLogger)
api.use(express.json())
api.use("/api/v1", v1Router)
api.use("/api/v1", errorHandler)

api.listen(API_PORT, () => logger.info({ port: API_PORT }, "Server listening"))
