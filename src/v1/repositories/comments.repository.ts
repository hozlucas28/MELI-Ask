import type { Pool } from "pg"
import type { Comment, CommentBody, Reply } from "#v1/types/comment"

type CommentIdentifier = {
    commentId: string
    productId: string
}

type CreateComment = {
    body: CommentBody
    productId: string
}

type CreateReply = {
    body: CommentBody
    commentId: string
    productId: string
    updatesKnowledge: boolean
}

type CommentRow = Omit<Comment, "createdAt"> & {
    createdAt: Date
}

type ReplyRow = Omit<Reply, "createdAt"> & {
    createdAt: Date
}

interface CommentsRepository {
    addReply(input: CreateReply): Promise<Reply>
    create(input: CreateComment): Promise<Comment>
    findById(input: CommentIdentifier): Promise<Comment | undefined>
    getByProductId(productId: string): Promise<Comment[]>
}

class PostgresCommentsRepository implements CommentsRepository {
    private readonly database: Pool

    constructor(database: Pool) {
        this.database = database
    }

    async getByProductId(productId: string): Promise<Comment[]> {
        const result = await this.database.query<CommentRow>(
            `
                SELECT
                    comments.id,
                    comments.product_id AS "productId",
                    comments.author_id AS "authorId",
                    comments.content,
                    comments.created_at AS "createdAt",
                    COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'id', replies.id,
                                'authorId', replies.author_id,
                                'content', replies.content,
                                'createdAt', replies.created_at
                            ) ORDER BY replies.created_at
                        ) FILTER (WHERE replies.id IS NOT NULL),
                        '[]'::jsonb
                    ) AS replies
                FROM comments
                LEFT JOIN replies ON replies.comment_id = comments.id
                WHERE comments.product_id = $1
                GROUP BY comments.id
                ORDER BY comments.created_at
            `,
            [productId]
        )

        return result.rows.map(row => this.mapComment(row))
    }

    async findById(input: CommentIdentifier): Promise<Comment | undefined> {
        const comments = await this.getByProductId(input.productId)

        return comments.find(comment => comment.id === input.commentId)
    }

    async create(input: CreateComment): Promise<Comment> {
        const result = await this.database.query<CommentRow>(
            `
                INSERT INTO comments (id, product_id, author_id, content)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    product_id AS "productId",
                    author_id AS "authorId",
                    content,
                    created_at AS "createdAt",
                    '[]'::jsonb AS replies
            `,
            [crypto.randomUUID(), input.productId, input.body.authorId, input.body.content]
        )

        return this.mapComment(result.rows[0])
    }

    async addReply(input: CreateReply): Promise<Reply> {
        const result = await this.database.query<ReplyRow>(
            `
                WITH inserted_reply AS (
                    INSERT INTO replies (id, comment_id, author_id, content)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, author_id AS "authorId", content, created_at AS "createdAt"
                ), updated_knowledge AS (
                    INSERT INTO product_knowledge_versions (product_id, generation)
                    SELECT $5, 1
                    WHERE $6
                    ON CONFLICT (product_id) DO UPDATE
                    SET generation = product_knowledge_versions.generation + 1
                )
                SELECT * FROM inserted_reply
            `,
            [crypto.randomUUID(), input.commentId, input.body.authorId, input.body.content, input.productId, input.updatesKnowledge]
        )
        const reply = result.rows[0]

        return { ...reply, createdAt: reply.createdAt.toISOString() }
    }

    private mapComment(row: CommentRow): Comment {
        return { ...row, createdAt: row.createdAt.toISOString() }
    }
}

export { PostgresCommentsRepository }
export type { CommentsRepository }
