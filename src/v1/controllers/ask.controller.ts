import { HttpStatus } from "#shared/enums/http-status.enum"

import type { Request, Response } from "express"
import type { ProductsRepository } from "#v1/repositories/products.repository"
import type { AskBody } from "#v1/schemas/ask.schema"
import type { ProductIdParams } from "#v1/schemas/product.schema"
import type { ProductQuestionAnswerer } from "#v1/services/ask.service"

type AskControllerDependencies = {
    productsRepository: ProductsRepository
    productQuestionAnswerer: ProductQuestionAnswerer
}

type StreamAnswerInput = {
    req: Request<ProductIdParams, unknown, AskBody>
    res: Response
    productId: string
}

class AskController {
    private readonly productsRepository: ProductsRepository
    private readonly productQuestionAnswerer: ProductQuestionAnswerer

    constructor(dependencies: AskControllerDependencies) {
        this.productsRepository = dependencies.productsRepository
        this.productQuestionAnswerer = dependencies.productQuestionAnswerer
    }

    ask() {
        return async (req: Request<ProductIdParams, unknown, AskBody>, res: Response): Promise<Response> => {
            const { productId } = req.params

            const product = await this.productsRepository.getById(productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })

            if (req.accepts("text/event-stream")) return this.streamAnswer({ req, res, productId })

            const answer = await this.productQuestionAnswerer.ask({ productId, question: req.body.question })

            return res.json({ answer })
        }
    }

    private async streamAnswer(input: StreamAnswerInput): Promise<Response> {
        const { req, res, productId } = input
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(new Error("the language model response timed out.")), 25_000)
        res.once("close", () => {
            if (!res.writableEnded) controller.abort()
        })
        res.status(HttpStatus.Ok).set({
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no"
        })
        res.flushHeaders()
        res.write("event: ready\ndata: {}\n\n")
        res.flush()

        try {
            for await (const delta of this.productQuestionAnswerer.askStream(
                { productId, question: req.body.question },
                controller.signal
            )) {
                res.write(`event: answer\ndata: ${JSON.stringify({ delta })}\n\n`)
                res.flush()
            }
            res.write("event: complete\ndata: {}\n\n")
        } catch {
            res.write(
                `event: error\ndata: ${JSON.stringify({ message: "Unable to generate an answer at this time." })}\n\n`
            )
        } finally {
            clearTimeout(timeout)
            res.end()
        }

        return res
    }
}

export { AskController }
