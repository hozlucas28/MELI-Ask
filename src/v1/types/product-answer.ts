type PendingProductAnswer = {
    answer: string
    question: string
    replyId: string
}

type ProductAnswerContext = {
    answer: string
    question: string
    similarity: number
}

export type { PendingProductAnswer, ProductAnswerContext }
