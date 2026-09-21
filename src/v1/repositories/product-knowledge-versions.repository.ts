import type { Pool } from "pg"

interface ProductKnowledgeVersionsRepository {
    get(productId: string): Promise<number>
}

class PostgresProductKnowledgeVersionsRepository implements ProductKnowledgeVersionsRepository {
    private readonly database: Pool

    constructor(database: Pool) {
        this.database = database
    }

    async get(productId: string): Promise<number> {
        const result = await this.database.query<{ generation: number }>(
            "SELECT generation FROM product_knowledge_versions WHERE product_id = $1",
            [productId]
        )

        return result.rows[0]?.generation ?? 0
    }
}

export { PostgresProductKnowledgeVersionsRepository }
export type { ProductKnowledgeVersionsRepository }
