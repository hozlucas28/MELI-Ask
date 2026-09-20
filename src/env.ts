import z from "zod"

const schema = z.object({
    API_URL: z.url(),
    API_PORT: z.string(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
})

export const { API_URL, API_PORT, LOG_LEVEL } = schema.parse(process.env)
