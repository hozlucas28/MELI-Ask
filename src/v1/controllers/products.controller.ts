import type { Request, Response } from "express"
import { HttpStatus } from "../../shared/enums/http-status.enum.ts"
import type { ProductsRepository } from "../repositories/products.repository.ts"
import type { ProductIdParams } from "../schemas/product.schema.ts"

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
            if (!product) return res.status(HttpStatus.NotFound).json({ message: "Producto no encontrado." })

            return res.json(product)
        }
    }
}

export { ProductsController }
