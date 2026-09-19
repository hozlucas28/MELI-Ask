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
                name: "Auriculares inalámbricos",
                price: 29999,
                description: "Auriculares Bluetooth con cancelación de ruido."
            },
            {
                id: "b92c5da6-8857-44f1-b69a-968292d3ef01",
                name: "Teclado mecánico",
                price: 89999,
                description: "Teclado compacto con switches mecánicos."
            },
            {
                id: "d5421329-0f66-4d88-a49f-d1f9110ae2ec",
                name: "Monitor 27 pulgadas",
                price: 349999,
                description: "Monitor IPS 144 Hz con resolución QHD."
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
