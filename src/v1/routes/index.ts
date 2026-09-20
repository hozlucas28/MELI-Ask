import { Router } from "express"
import { errorHandler } from "../middlewares/error-handler.middleware.ts"
import { productsRouter } from "./products.routes.ts"

const v1Router = Router()

// Middlewares
v1Router.use("/products", productsRouter)
v1Router.use(errorHandler)

export { v1Router }
