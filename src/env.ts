import z from "zod"

const schema = z.object({
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    APP_URL: z.url(),
    APP_PORT: z.coerce.number().int().positive(),
    DATABASE_HOST: z.string().min(1),
    DATABASE_PORT: z.coerce.number().int().positive(),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_APP_DATABASE: z.string().min(1),
    OPENROUTER_API_KEY: z.string().min(1),
    OPENROUTER_MODEL: z.string().min(1),
    OPENROUTER_EMBEDDING_MODEL: z.string().min(1),
    REDIS_URL: z.url().default("redis://localhost:6379"),
    SENTRY_DSN: z.preprocess(value => (value === "" ? undefined : value), z.url().optional()),
    SENTRY_ENVIRONMENT: z.string().min(1).default("development")
})

const {
    LOG_LEVEL,
    APP_URL,
    APP_PORT,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_APP_DATABASE,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    OPENROUTER_EMBEDDING_MODEL,
    REDIS_URL,
    SENTRY_DSN,
    SENTRY_ENVIRONMENT
} = schema.parse(process.env)

export {
    LOG_LEVEL,
    APP_URL,
    APP_PORT,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_APP_DATABASE,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    OPENROUTER_EMBEDDING_MODEL,
    REDIS_URL,
    SENTRY_DSN,
    SENTRY_ENVIRONMENT
}
