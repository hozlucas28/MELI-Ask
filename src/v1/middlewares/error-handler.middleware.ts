import { HttpStatus } from "../../shared/enums/http-status.enum.ts"

import type { ErrorRequestHandler } from "express"

const errorHandler: ErrorRequestHandler = (error, req, res, next): void => {
    if (res.headersSent) {
        next(error)
        return
    }

    const err = error instanceof Error ? error : new Error(String(error))
    req.log.error({ err }, "unhandled request error")

    res.status(HttpStatus.InternalServerError).json({ message: "An internal error occurred." })
}

export { errorHandler }
