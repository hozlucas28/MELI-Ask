import { HttpStatus } from "#shared/enums/http-status.enum"

import type { Request, Response } from "express"
import type { ProductsRepository } from "#v1/repositories/products.repository"
import type { ProductIdParams } from "#v1/schemas/product.schema"

class ProductsController {
    private readonly productsRepository: ProductsRepository

    constructor(productsRepository: ProductsRepository) {
        this.productsRepository = productsRepository
    }

    getProducts() {
        return (_req: Request, res: Response): Response => {
            return res.json(this.productsRepository.getAll())
        }
    }

    getProductById() {
        return (req: Request<ProductIdParams>, res: Response): Response => {
            const product = this.productsRepository.getById(req.params.productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })

            return res.json(product)
        }
    }
}

export { ProductsController }
