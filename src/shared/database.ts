import { Pool } from "pg"
import { DATABASE_APP_DATABASE, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USER } from "#src/env"

const database = new Pool({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_APP_DATABASE
})

export { database }
