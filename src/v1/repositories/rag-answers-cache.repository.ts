import { createHash } from "node:crypto"
import type { RedisClientType } from "redis"
import type { OpenRouter } from "@openrouter/sdk"
import type { ProductKnowledgeVersionsRepository } from "#v1/repositories/product-knowledge-versions.repository"

const cachePrefix = "rag:answer"
const promptVersion = "v1"
const minimumSimilarity = 0.95

type RagAnswersCacheDependencies = {
    embeddingModel: string
    knowledgeVersionsRepository: ProductKnowledgeVersionsRepository
    model: string
    openRouter: OpenRouter
    redis: RedisClientType
}

type GetRagAnswer = {
    productId: string
    question: string
}

type SetRagAnswer = GetRagAnswer & {
    answer: string
    embedding: number[]
    generation: number
}

type RagAnswerLookup = {
    answer?: string
    embedding?: number[]
    generation: number
}

interface RagAnswersCache {
    get(input: GetRagAnswer): Promise<RagAnswerLookup>
    invalidateProduct(productId: string): Promise<void>
    set(input: SetRagAnswer): Promise<void>
}

class RedisRagAnswersCache implements RagAnswersCache {
    private readonly embeddingModel: string
    private readonly knowledgeVersionsRepository: ProductKnowledgeVersionsRepository
    private readonly model: string
    private readonly openRouter: OpenRouter
    private readonly redis: RedisClientType

    constructor(dependencies: RagAnswersCacheDependencies) {
        this.embeddingModel = dependencies.embeddingModel
        this.knowledgeVersionsRepository = dependencies.knowledgeVersionsRepository
        this.model = dependencies.model
        this.openRouter = dependencies.openRouter
        this.redis = dependencies.redis
    }

    async get(input: GetRagAnswer): Promise<RagAnswerLookup> {
        const generation = await this.knowledgeVersionsRepository.get(input.productId)
        const questionHash = createHash("sha256").update(this.normalizeQuestion(input.question)).digest("hex")
        const exactKey = `${cachePrefix}:${input.productId}:${generation}:${questionHash}`
        const exactAnswer = await this.redis.hGet(exactKey, "answer")
        if (exactAnswer) return { answer: exactAnswer, generation }

        const embedding = await this.createEmbedding(input.question)
        const embeddingModelTag = this.createTag(this.embeddingModel)
        const modelTag = this.createTag(this.model)
        const result = await this.redis.sendCommand([
            "FT.SEARCH",
            "rag_answers_idx",
            `@productId:{${input.productId}} @generation:{${generation}} @embeddingModel:{${embeddingModelTag}} @model:{${modelTag}} @promptVersion:{${promptVersion}}=>[KNN 1 @embedding $vector AS score]`,
            "PARAMS",
            "2",
            "vector",
            this.toBuffer(embedding),
            "SORTBY",
            "score",
            "RETURN",
            "2",
            "answer",
            "score",
            "DIALECT",
            "2"
        ])
        const [, key, fields] = result as unknown as [number, string?, string[]?]
        const score = fields?.[fields.indexOf("score") + 1]
        const answer = fields?.[fields.indexOf("answer") + 1]

        if (!key || !score || !answer || Number(score) > 1 - minimumSimilarity) return { embedding, generation }

        return { answer, embedding, generation }
    }

    async set(input: SetRagAnswer): Promise<void> {
        const generation = await this.knowledgeVersionsRepository.get(input.productId)
        if (generation !== input.generation) return
        const questionHash = createHash("sha256").update(this.normalizeQuestion(input.question)).digest("hex")
        const key = `${cachePrefix}:${input.productId}:${generation}:${questionHash}`

        await this.redis.sendCommand([
            "HSET",
            key,
            "productId",
            input.productId,
            "generation",
            String(generation),
            "embeddingModel",
            this.createTag(this.embeddingModel),
            "model",
            this.createTag(this.model),
            "promptVersion",
            promptVersion,
            "answer",
            input.answer,
            "embedding",
            this.toBuffer(input.embedding)
        ])
        await this.redis.sAdd(`${cachePrefix}:${input.productId}:keys`, key)
    }

    async invalidateProduct(productId: string): Promise<void> {
        const keysKey = `${cachePrefix}:${productId}:keys`
        const keys = await this.redis.sMembers(keysKey)
        if (keys.length > 0) await this.redis.del(keys)
        await this.redis.del(keysKey)
    }

    private async createEmbedding(question: string): Promise<number[]> {
        const response = await this.openRouter.embeddings.generate(
            {
                requestBody: {
                    dimensions: 2048,
                    encodingFormat: "float",
                    input: this.normalizeQuestion(question),
                    model: this.embeddingModel
                }
            },
            { timeoutMs: 15_000 }
        )
        if (typeof response === "string") throw new Error("OpenRouter returned an invalid embedding response.")

        const item = response.data[0]
        if (!item || typeof item.embedding === "string") throw new Error("OpenRouter returned a non-numeric embedding.")

        return item.embedding
    }

    private normalizeQuestion(question: string): string {
        return question.trim().normalize("NFC")
    }

    private createTag(value: string): string {
        return createHash("sha256").update(value).digest("hex")
    }

    private toBuffer(embedding: number[]): Buffer {
        return Buffer.from(new Float32Array(embedding).buffer)
    }
}

async function initializeRagAnswersCache(redis: RedisClientType): Promise<void> {
    try {
        await redis.sendCommand([
            "FT.CREATE",
            "rag_answers_idx",
            "ON",
            "HASH",
            "PREFIX",
            "1",
            `${cachePrefix}:`,
            "SCHEMA",
            "productId",
            "TAG",
            "generation",
            "TAG",
            "embeddingModel",
            "TAG",
            "model",
            "TAG",
            "promptVersion",
            "TAG",
            "answer",
            "TEXT",
            "embedding",
            "VECTOR",
            "HNSW",
            "6",
            "TYPE",
            "FLOAT32",
            "DIM",
            "2048",
            "DISTANCE_METRIC",
            "COSINE"
        ])
    } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("Index already exists")) throw error
    }
}

export { RedisRagAnswersCache, initializeRagAnswersCache }
export type { RagAnswerLookup, RagAnswersCache }
