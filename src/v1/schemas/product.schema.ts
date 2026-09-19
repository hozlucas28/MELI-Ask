import { z } from "zod"

const productIdParamsSchema = z.object({
    productId: z.uuid()
})

type ProductIdParams = z.infer<typeof productIdParamsSchema>

export { productIdParamsSchema }
export type { ProductIdParams }
