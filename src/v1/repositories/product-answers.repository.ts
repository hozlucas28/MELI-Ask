import pgvector from "pgvector"

import type { Pool } from "pg"
import type { PendingProductAnswer, ProductAnswerContext } from "#v1/types/product-answer"

type SaveEmbedding = {
    embedding: number[]
    embeddingModel: string
    replyId: string
}

type FindPendingProductAnswers = {
    embeddingModel: string
    productId: string
}

type SearchProductAnswers = {
    embedding: number[]
    embeddingModel: string
    limit: number
    productId: string
}

interface ProductAnswersRepository {
    findPending(input: FindPendingProductAnswers): Promise<PendingProductAnswer[]>
    saveEmbedding(input: SaveEmbedding): Promise<void>
    search(input: SearchProductAnswers): Promise<ProductAnswerContext[]>
}

class PostgresProductAnswersRepository implements ProductAnswersRepository {
    private readonly database: Pool

    constructor(database: Pool) {
        this.database = database
    }

    async findPending(input: FindPendingProductAnswers): Promise<PendingProductAnswer[]> {
        const result = await this.database.query<PendingProductAnswer>(
            `
                SELECT replies.id AS "replyId", comments.content AS question, replies.content AS answer
                FROM replies
                INNER JOIN comments ON comments.id = replies.comment_id
                INNER JOIN products ON products.id = comments.product_id
                WHERE comments.product_id = $1
                    AND replies.author_id = products.owner_id
                    AND (replies.embedding IS NULL OR replies.embedding_model IS DISTINCT FROM $2)
                ORDER BY replies.created_at
            `,
            [input.productId, input.embeddingModel]
        )

        return result.rows
    }

    async saveEmbedding(input: SaveEmbedding): Promise<void> {
        const embedding = pgvector.toSql(input.embedding)

        await this.database.query("UPDATE replies SET embedding = $1, embedding_model = $2 WHERE id = $3", [
            embedding,
            input.embeddingModel,
            input.replyId
        ])
    }

    async search(input: SearchProductAnswers): Promise<ProductAnswerContext[]> {
        const embedding = pgvector.toSql(input.embedding)
        const result = await this.database.query<ProductAnswerContext>(
            `
                SELECT
                    comments.content AS question,
                    replies.content AS answer,
                    1 - (replies.embedding <=> $2::halfvec) AS similarity
                FROM replies
                INNER JOIN comments ON comments.id = replies.comment_id
                INNER JOIN products ON products.id = comments.product_id
                WHERE comments.product_id = $1
                    AND replies.author_id = products.owner_id
                    AND replies.embedding IS NOT NULL
                    AND replies.embedding_model = $4
                ORDER BY replies.embedding <=> $2::halfvec
                LIMIT $3
            `,
            [input.productId, embedding, input.limit, input.embeddingModel]
        )

        return result.rows
    }
}

export { PostgresProductAnswersRepository }
export type { ProductAnswersRepository }
