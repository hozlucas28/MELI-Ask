import { Router } from "express"
import { errorHandler } from "#v1/middlewares/error-handler.middleware"
import { createAskRouter } from "#v1/routes/ask.routes"
import { createProductsRouter } from "#v1/routes/products.routes"

import type { Pool } from "pg"

function createV1Router(database: Pool): Router {
    const v1Router = Router()
    const askRouter = createAskRouter(database)
    const productsRouter = createProductsRouter(database)

    v1Router.use(askRouter)
    v1Router.use("/products", productsRouter)
    v1Router.use(errorHandler)

    return v1Router
}

export { createV1Router }
