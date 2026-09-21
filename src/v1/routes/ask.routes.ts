import { Router } from "express"
import { OpenRouter } from "@openrouter/sdk"
import { APP_URL, OPENROUTER_API_KEY, OPENROUTER_EMBEDDING_MODEL, OPENROUTER_MODEL } from "#src/env"
import { AskController } from "#v1/controllers/ask.controller"
import { validateRequest } from "#v1/middlewares/validate-request.middleware"
import { PostgresProductAnswersRepository } from "#v1/repositories/product-answers.repository"
import { PostgresProductsRepository } from "#v1/repositories/products.repository"
import { askBodySchema } from "#v1/schemas/ask.schema"
import { productIdParamsSchema } from "#v1/schemas/product.schema"
import { AgenticAskService } from "#v1/services/ask.service"
import { ProductRagService } from "#v1/services/product-rag.service"

import type { Pool } from "pg"
import type { RagAnswersCache } from "#v1/repositories/rag-answers-cache.repository"
import type { AskBody } from "#v1/schemas/ask.schema"
import type { ProductIdParams } from "#v1/schemas/product.schema"

type CreateAskRouterInput = {
    database: Pool
    ragAnswersCache: RagAnswersCache
}

function createAskRouter(input: CreateAskRouterInput): Router {
    const { database, ragAnswersCache } = input
    const openRouterOptions = {
        apiKey: OPENROUTER_API_KEY,
        appTitle: "MELI Ask",
        httpReferer: APP_URL
    }
    const openRouter = new OpenRouter(openRouterOptions)

    const productsRepository = new PostgresProductsRepository(database)
    const productAnswersRepository = new PostgresProductAnswersRepository(database)
    const productRagServiceDependencies = {
        embeddingModel: OPENROUTER_EMBEDDING_MODEL,
        openRouter,
        productAnswersRepository
    }
    const productRagService = new ProductRagService(productRagServiceDependencies)
    const askServiceDependencies = { model: OPENROUTER_MODEL, openRouter, productRagService, ragAnswersCache }
    const productQuestionAnswerer = new AgenticAskService(askServiceDependencies)
    const askControllerDependencies = { productQuestionAnswerer, productsRepository }
    const askController = new AskController(askControllerDependencies)

    const askRouter = Router()

    askRouter.post<ProductIdParams, unknown, AskBody>(
        "/:productId/ask",
        validateRequest({ params: productIdParamsSchema, body: askBodySchema }),
        askController.ask()
    )

    return askRouter
}

export { createAskRouter }
