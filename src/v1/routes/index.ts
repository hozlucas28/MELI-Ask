import { Router } from "express"
import { errorHandler } from "#v1/middlewares/error-handler.middleware"
import { productsRouter } from "#v1/routes/products.routes"

const v1Router = Router()

// Middlewares
v1Router.use("/products", productsRouter)
v1Router.use(errorHandler)

export { v1Router }
