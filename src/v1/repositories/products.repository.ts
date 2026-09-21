import type { Pool } from "pg"
import type { Product } from "#v1/types/product"

interface ProductsRepository {
    getAll(): Promise<Product[]>
    getById(productId: string): Promise<Product | undefined>
}

class PostgresProductsRepository implements ProductsRepository {
    private readonly database: Pool

    constructor(database: Pool) {
        this.database = database
    }

    async getAll(): Promise<Product[]> {
        const result = await this.database.query<Product>(`
            SELECT id, owner_id AS "ownerId", name, price, description
            FROM products
            ORDER BY name
        `)

        return result.rows
    }

    async getById(productId: string): Promise<Product | undefined> {
        const result = await this.database.query<Product>(
            `
                SELECT id, owner_id AS "ownerId", name, price, description
                FROM products
                WHERE id = $1
            `,
            [productId]
        )

        return result.rows[0]
    }
}

export { PostgresProductsRepository }
export type { ProductsRepository }
