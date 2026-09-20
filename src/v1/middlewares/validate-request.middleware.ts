import { HttpStatus } from "#shared/enums/http-status.enum"

import type { NextFunction, Request, RequestHandler, Response } from "express"
import type { ZodType } from "zod"

type RequestValidationSchemas = {
    params?: ZodType
    body?: ZodType
}

function validateRequest(schemas: RequestValidationSchemas): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (schemas.params) {
            const params = schemas.params.safeParse(req.params)

            if (!params.success) {
                res.status(HttpStatus.BadRequest).json({
                    message: "Request data is invalid.",
                    errors: params.error.issues
                })
                return
            }
        }

        if (schemas.body) {
            const body = schemas.body.safeParse(req.body)

            if (!body.success) {
                res.status(HttpStatus.BadRequest).json({
                    message: "Request data is invalid.",
                    errors: body.error.issues
                })
                return
            }

            req.body = body.data
        }

        next()
    }
}

export { validateRequest }
export type { RequestValidationSchemas }
