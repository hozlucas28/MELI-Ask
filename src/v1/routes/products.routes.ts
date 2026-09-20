import { Router } from "express"
import { ProductsController } from "../controllers/products.controller.ts"
import { CommentsController } from "../controllers/comments.controller.ts"
import { validateRequest } from "../middlewares/validate-request.middleware.ts"
import { InMemoryCommentsRepository } from "../repositories/comments.repository.ts"
import { InMemoryProductsRepository } from "../repositories/products.repository.ts"
import { commentBodySchema, commentParamsSchema } from "../schemas/comment.schema.ts"
import { productIdParamsSchema } from "../schemas/product.schema.ts"

import type { CommentBody, CommentParams } from "../schemas/comment.schema.ts"
import type { ProductIdParams } from "../schemas/product.schema.ts"

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
