import { Router } from "express"
import { OpenRouter } from "@openrouter/sdk"
import { APP_URL, OPENROUTER_API_KEY, OPENROUTER_EMBEDDING_MODEL, OPENROUTER_MODEL } from "#src/env"
import { createAskRouter } from "#v1/routes/ask.routes"
import { createProductsRouter } from "#v1/routes/products.routes"
import { PostgresProductKnowledgeVersionsRepository } from "#v1/repositories/product-knowledge-versions.repository"
import { RedisRagAnswersCache } from "#v1/repositories/rag-answers-cache.repository"

import type { Pool } from "pg"
import type { RedisClientType } from "redis"

type CreateV1RouterInput = {
    database: Pool
    redis: RedisClientType
}

function createV1Router(input: CreateV1RouterInput): Router {
    const { database, redis } = input
    const openRouterOptions = { apiKey: OPENROUTER_API_KEY, appTitle: "MELI Ask", httpReferer: APP_URL }
    const cacheOpenRouter = new OpenRouter(openRouterOptions)
    const knowledgeVersionsRepository = new PostgresProductKnowledgeVersionsRepository(database)
    const ragAnswersCacheDependencies = {
        embeddingModel: OPENROUTER_EMBEDDING_MODEL,
        knowledgeVersionsRepository,
        model: OPENROUTER_MODEL,
        openRouter: cacheOpenRouter,
        redis
    }
    const ragAnswersCache = new RedisRagAnswersCache(ragAnswersCacheDependencies)
    const v1Router = Router()
    const askRouter = createAskRouter({ database, ragAnswersCache })
    const productsRouter = createProductsRouter({ database, ragAnswersCache })

    v1Router.use(askRouter)
    v1Router.use("/products", productsRouter)
    return v1Router
}

export { createV1Router }
