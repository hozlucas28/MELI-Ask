type CommentBody = {
    authorId: string
    content: string
}

type Reply = CommentBody & {
    id: string
    createdAt: string
}

type Comment = CommentBody & {
    id: string
    productId: string
    createdAt: string
    replies: Reply[]
}

export type { Comment, CommentBody, Reply }
