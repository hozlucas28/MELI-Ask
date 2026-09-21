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
        return async (_req: Request, res: Response): Promise<Response> => {
            const products = await this.productsRepository.getAll()

            return res.json(products)
        }
    }

    getProductById() {
        return async (req: Request<ProductIdParams>, res: Response): Promise<Response> => {
            const product = await this.productsRepository.getById(req.params.productId)
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Product not found." })

            return res.json(product)
        }
    }
}

export { ProductsController }
