import type { Comment, CommentBody, Reply } from "#v1/types/comment"

interface CommentsRepository {
    addReply(comment: Comment, body: CommentBody): Reply
    create(productId: string, body: CommentBody): Comment
    findById(productId: string, commentId: string): Comment | undefined
    getByProductId(productId: string): Comment[]
}

class InMemoryCommentsRepository implements CommentsRepository {
    private readonly comments: Comment[]

    constructor() {
        this.comments = []
    }

    getByProductId(productId: string): Comment[] {
        return this.comments.filter(comment => comment.productId === productId)
    }

    findById(productId: string, commentId: string): Comment | undefined {
        return this.comments.find(comment => comment.id === commentId && comment.productId === productId)
    }

    create(productId: string, body: CommentBody): Comment {
        const comment: Comment = {
            id: crypto.randomUUID(),
            productId,
            authorId: body.authorId,
            content: body.content,
            createdAt: new Date().toISOString(),
            replies: []
        }

        this.comments.push(comment)

        return comment
    }

    addReply(comment: Comment, body: CommentBody): Reply {
        const reply: Reply = {
            id: crypto.randomUUID(),
            authorId: body.authorId,
            content: body.content,
            createdAt: new Date().toISOString()
        }

        comment.replies.push(reply)

        return reply
    }
}

export { InMemoryCommentsRepository }
export type { CommentsRepository }
