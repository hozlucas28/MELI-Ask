import { Router } from "express"
import { CommentsController } from "#v1/controllers/comments.controller"
import { ProductsController } from "#v1/controllers/products.controller"
import { validateRequest } from "#v1/middlewares/validate-request.middleware"
import { InMemoryCommentsRepository } from "#v1/repositories/comments.repository"
import { InMemoryProductsRepository } from "#v1/repositories/products.repository"
import { commentBodySchema, commentParamsSchema } from "#v1/schemas/comment.schema"
import { productIdParamsSchema } from "#v1/schemas/product.schema"

import type { CommentBody, CommentParams } from "#v1/schemas/comment.schema"
import type { ProductIdParams } from "#v1/schemas/product.schema"

// Modules
const productsRepository = new InMemoryProductsRepository()
const productsController = new ProductsController(productsRepository)

const commentsRepository = new InMemoryCommentsRepository()
const commentsController = new CommentsController(commentsRepository, productsRepository)

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

export { productsRouter }
