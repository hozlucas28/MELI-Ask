import { z } from "zod"

const askBodySchema = z.object({
    question: z.string().trim().min(4).max(1024)
})

type AskBody = z.infer<typeof askBodySchema>

export { askBodySchema }
export type { AskBody }
