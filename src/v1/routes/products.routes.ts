import { Router } from "express"
import { CommentsController } from "#v1/controllers/comments.controller"
import { ProductsController } from "#v1/controllers/products.controller"
import { validateRequest } from "#v1/middlewares/validate-request.middleware"
import { PostgresCommentsRepository } from "#v1/repositories/comments.repository"
import { PostgresProductsRepository } from "#v1/repositories/products.repository"
import { commentBodySchema, commentParamsSchema } from "#v1/schemas/comment.schema"
import { productIdParamsSchema } from "#v1/schemas/product.schema"

import type { Pool } from "pg"
import type { RagAnswersCache } from "#v1/repositories/rag-answers-cache.repository"
import type { CommentBody, CommentParams } from "#v1/schemas/comment.schema"
import type { ProductIdParams } from "#v1/schemas/product.schema"

type CreateProductsRouterInput = {
    database: Pool
    ragAnswersCache: RagAnswersCache
}

function createProductsRouter(input: CreateProductsRouterInput): Router {
    const { database, ragAnswersCache } = input
    // Modules
    const productsRepository = new PostgresProductsRepository(database)
    const productsController = new ProductsController(productsRepository)

    const commentsRepository = new PostgresCommentsRepository(database)
    const commentsControllerInput = { commentsRepository, productsRepository, ragAnswersCache }
    const commentsController = new CommentsController(commentsControllerInput)

    // Routes
    const productsRouter = Router()

    productsRouter
        .get("/", productsController.getProducts())
        .get<ProductIdParams>(
            "/:productId",
            validateRequest({ params: productIdParamsSchema }),
            productsController.getProductById()
        )
        .get<ProductIdParams>(
            "/:productId/comments",
            validateRequest({ params: productIdParamsSchema }),
            commentsController.getComments()
        )
        .post<ProductIdParams, unknown, CommentBody>(
            "/:productId/comments",
            validateRequest({ params: productIdParamsSchema, body: commentBodySchema }),
            commentsController.createComment()
        )
        .get<CommentParams>(
            "/:productId/comments/:commentId/replies",
            validateRequest({ params: commentParamsSchema }),
            commentsController.getCommentReplies()
        )
        .post<CommentParams, unknown, CommentBody>(
            "/:productId/comments/:commentId/replies",
            validateRequest({ params: commentParamsSchema, body: commentBodySchema }),
            commentsController.replyComment()
        )

    return productsRouter
}

export { createProductsRouter }
