import z from "zod"

const schema = z.object({
    API_URL: z.url(),
    API_PORT: z.string()
})

export const { API_URL, API_PORT } = schema.parse(process.env)
