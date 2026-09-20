import type { Product } from "../types/product.ts"

interface ProductsRepository {
    getAll(): Product[]
    getById(productId: string): Product | undefined
}

class InMemoryProductsRepository implements ProductsRepository {
    private readonly products: Product[]

    constructor() {
        this.products = [
            {
                id: "264a6a79-e6df-4da7-8c03-a8698a7272b1",
                name: "Wireless headphones",
                price: 29999,
                description: "Bluetooth headphones with noise cancellation."
            },
            {
                id: "b92c5da6-8857-44f1-b69a-968292d3ef01",
                name: "Mechanical keyboard",
                price: 89999,
                description: "Compact keyboard with mechanical switches."
            },
            {
                id: "d5421329-0f66-4d88-a49f-d1f9110ae2ec",
                name: "27-inch monitor",
                price: 349999,
                description: "144 Hz IPS monitor with QHD resolution."
            }
        ]
    }

    getAll(): Product[] {
        return this.products
    }

    getById(productId: string): Product | undefined {
        return this.products.find(product => product.id === productId)
    }
}

export { InMemoryProductsRepository }
export type { ProductsRepository }
