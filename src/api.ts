import express, { type Express } from "express"
import { v1Router } from "./v1/routes/index.ts"
import { API_PORT } from "./env.ts"

const api: Express = express()

// Middlewares
api.use(express.json())
api.use("/api/v1", v1Router)

api.listen(API_PORT, () => console.log(`> Server listening on http://localhost:${API_PORT}`))
