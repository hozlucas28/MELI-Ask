import { HttpStatus } from "#shared/enums/http-status.enum"

import type { Request, Response } from "express"
import type { CommentsRepository } from "#v1/repositories/comments.repository"
import type { ProductsRepository } from "#v1/repositories/products.repository"
import type { RagAnswersCache } from "#v1/repositories/rag-answers-cache.repository"
import type { CommentBody, CommentParams } from "#v1/schemas/comment.schema"
import type { ProductIdParams } from "#v1/schemas/product.schema"

class CommentsController {
    private readonly commentsRepository: CommentsRepository
    private readonly productsRepository: ProductsRepository
    private readonly ragAnswersCache: RagAnswersCache

    constructor(input: {
        commentsRepository: CommentsRepository
        productsRepository: ProductsRepository
        ragAnswersCache: RagAnswersCache
    }) {
        this.commentsRepository = input.commentsRepository
        this.productsRepository = input.productsRepository
        this.ragAnswersCache = input.ragAnswersCache
    }

    getComments() {
        return async (req: Request<ProductIdParams>, res: Response): Promise<Response> => {
            const { productId } = req.params

            const product = await this.productsRepository.getById(productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })
            const comments = await this.commentsRepository.getByProductId(productId)

            return res.json(comments)
        }
    }

    getCommentReplies() {
        return async (req: Request<CommentParams>, res: Response): Promise<Response> => {
            const { commentId, productId } = req.params

            const product = await this.productsRepository.getById(productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })
            const comment = await this.commentsRepository.findById({ productId, commentId })
            if (!comment) return res.status(HttpStatus.NotFound).json({ message: "Comment not found." })

            return res.json(comment.replies)
        }
    }

    replyComment() {
        return async (req: Request<CommentParams, unknown, CommentBody>, res: Response): Promise<Response> => {
            const { commentId, productId } = req.params

            const product = await this.productsRepository.getById(productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })
            const comment = await this.commentsRepository.findById({ productId, commentId })
            if (!comment) return res.status(HttpStatus.NotFound).json({ message: "Comment not found." })

            const updatesKnowledge = req.body.authorId === product.ownerId
            const reply = await this.commentsRepository.addReply({ commentId, productId, body: req.body, updatesKnowledge })
            if (updatesKnowledge) {
                try {
                    await this.ragAnswersCache.invalidateProduct(productId)
                } catch (error) {
                    req.log.error({ err: error, productId }, "Unable to invalidate RAG answer cache")
                }
            }
            req.log.info({ productId, commentId, replyId: reply.id }, "comment reply created")

            return res.status(201).json(reply)
        }
    }

    createComment() {
        return async (req: Request<ProductIdParams, unknown, CommentBody>, res: Response): Promise<Response> => {
            const { productId } = req.params

            const product = await this.productsRepository.getById(productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })

            const comment = await this.commentsRepository.create({ productId, body: req.body })
            req.log.info({ productId, commentId: comment.id }, "comment created")

            return res.status(201).json(comment)
        }
    }
}

export { CommentsController }
