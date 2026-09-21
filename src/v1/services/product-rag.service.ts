import type { OpenRouter } from "@openrouter/sdk"
import type { ProductAnswersRepository } from "#v1/repositories/product-answers.repository"
import type { ProductAnswerContext } from "#v1/types/product-answer"

type ProductRagServiceDependencies = {
    embeddingModel: string
    openRouter: OpenRouter
    productAnswersRepository: ProductAnswersRepository
}

type RetrieveProductAnswers = {
    embedding?: number[]
    productId: string
    query: string
}

class ProductRagService {
    private readonly embeddingModel: string
    private readonly openRouter: OpenRouter
    private readonly productAnswersRepository: ProductAnswersRepository

    constructor(dependencies: ProductRagServiceDependencies) {
        this.embeddingModel = dependencies.embeddingModel
        this.openRouter = dependencies.openRouter
        this.productAnswersRepository = dependencies.productAnswersRepository
    }

    async retrieve(input: RetrieveProductAnswers): Promise<ProductAnswerContext[]> {
        await this.indexPendingAnswers(input.productId)

        const [embedding] = input.embedding ? [input.embedding] : await this.createEmbeddings([input.query])

        return this.productAnswersRepository.search({
            productId: input.productId,
            embedding,
            embeddingModel: this.embeddingModel,
            limit: 5
        })
    }

    private async indexPendingAnswers(productId: string): Promise<void> {
        const pendingAnswers = await this.productAnswersRepository.findPending({
            productId,
            embeddingModel: this.embeddingModel
        })
        if (pendingAnswers.length === 0) return

        const documents = pendingAnswers.map(answer => `Question: ${answer.question}\nAnswer: ${answer.answer}`)
        const embeddings = await this.createEmbeddings(documents)

        await Promise.all(
            pendingAnswers.map((answer, index) => {
                const embedding = embeddings[index]

                return this.productAnswersRepository.saveEmbedding({
                    replyId: answer.replyId,
                    embedding,
                    embeddingModel: this.embeddingModel
                })
            })
        )
    }

    private async createEmbeddings(input: string[]): Promise<number[][]> {
        const response = await this.openRouter.embeddings.generate(
            {
                requestBody: {
                    dimensions: 2048,
                    encodingFormat: "float",
                    input,
                    model: this.embeddingModel
                }
            },
            { timeoutMs: 15_000 }
        )
        if (typeof response === "string") throw new Error("OpenRouter returned an invalid embedding response.")

        return response.data
            .sort((first, second) => (first.index ?? 0) - (second.index ?? 0))
            .map(item => {
                if (typeof item.embedding === "string") throw new Error("OpenRouter returned a non-numeric embedding.")

                return item.embedding
            })
    }
}

export { ProductRagService }
