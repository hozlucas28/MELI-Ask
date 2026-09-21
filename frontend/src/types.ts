type Product = {
    id: string
    ownerId: string
    name: string
    price: number
    description: string
}

type Reply = {
    id: string
    authorId: string
    content: string
    createdAt: string
}

type Comment = {
    id: string
    productId: string
    authorId: string
    content: string
    createdAt: string
    replies: Reply[]
}

export type { Comment, Product, Reply }
