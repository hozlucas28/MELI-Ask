import { Router } from "express"
import { productsRouter } from "./products.routes.ts"

const v1Router = Router()

// Middlewares
v1Router.use("/products", productsRouter)

export { v1Router }
