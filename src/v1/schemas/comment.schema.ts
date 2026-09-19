import { z } from "zod"
import { productIdParamsSchema } from "./product.schema.ts"

const commentParamsSchema = productIdParamsSchema.extend({
    commentId: z.uuid()
})

const commentBodySchema = z.object({
    authorId: z.uuid(),
    content: z.string().trim().min(4).max(1024)
})

type CommentParams = z.infer<typeof commentParamsSchema>
type CommentBody = z.infer<typeof commentBodySchema>

export { commentBodySchema, commentParamsSchema }
export type { CommentBody, CommentParams }
