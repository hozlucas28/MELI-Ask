import type { Request, Response } from "express"
import { HttpStatus } from "../../shared/enums/http-status.enum.ts"
import type { CommentsRepository } from "../repositories/comments.repository.ts"
import type { ProductsRepository } from "../repositories/products.repository.ts"
import type { CommentBody, CommentParams } from "../schemas/comment.schema.ts"
import type { ProductIdParams } from "../schemas/product.schema.ts"

class CommentsController {
    private readonly commentsRepository: CommentsRepository
    private readonly productsRepository: ProductsRepository

    constructor(commentsRepository: CommentsRepository, productsRepository: ProductsRepository) {
        this.commentsRepository = commentsRepository
        this.productsRepository = productsRepository
    }

    getComments() {
        return (req: Request<ProductIdParams>, res: Response): Response => {
            const { productId } = req.params

            if (!this.productsRepository.getById(productId)) {
                return res.status(HttpStatus.NotFound).json({ message: "Producto no encontrado." })
            }

            return res.json(this.commentsRepository.getByProductId(productId))
        }
    }

    getCommentReplies() {
        return (req: Request<CommentParams>, res: Response): Response => {
            const { commentId, productId } = req.params

            if (!this.productsRepository.getById(productId)) {
                return res.status(HttpStatus.NotFound).json({ message: "Producto no encontrado." })
            }

            const comment = this.commentsRepository.findById(productId, commentId)
            if (!comment) return res.status(HttpStatus.NotFound).json({ message: "Comentario no encontrado." })

            return res.json(comment.replies)
        }
    }

    replyComment() {
        return (req: Request<CommentParams, unknown, CommentBody>, res: Response): Response => {
            const { commentId, productId } = req.params

            if (!this.productsRepository.getById(productId)) {
                return res.status(HttpStatus.NotFound).json({ message: "Producto no encontrado." })
            }

            const comment = this.commentsRepository.findById(productId, commentId)
            if (!comment) return res.status(HttpStatus.NotFound).json({ message: "Comentario no encontrado." })

            const reply = this.commentsRepository.addReply(comment, req.body)
            req.log.info({ productId, commentId, replyId: reply.id }, "Comment reply created")

            return res.status(201).json(reply)
        }
    }

    createComment() {
        return (req: Request<ProductIdParams, unknown, CommentBody>, res: Response): Response => {
            const { productId } = req.params

            if (!this.productsRepository.getById(productId)) {
                return res.status(HttpStatus.NotFound).json({ message: "Producto no encontrado." })
            }

            const comment = this.commentsRepository.create(productId, req.body)
            req.log.info({ productId, commentId: comment.id }, "Comment created")

            return res.status(201).json(comment)
        }
    }
}

export { CommentsController }
