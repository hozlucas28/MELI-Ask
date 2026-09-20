import { randomUUID } from "node:crypto"
import pino from "pino"
import { pinoHttp } from "pino-http"
import { LOG_LEVEL } from "#src/env"
import { HttpStatus } from "#shared/enums/http-status.enum"

import type { Request, Response } from "express"

const logger = pino({
    level: LOG_LEVEL
})

const httpLogger = pinoHttp<Request, Response>({
    logger,
    quietReqLogger: true,
    quietResLogger: true,
    customAttributeKeys: { reqId: "requestId" },
    genReqId: (req): string => {
        const requestId = req.headers["x-request-id"]
        return typeof requestId === "string" ? requestId : randomUUID()
    },
    customLogLevel: (_req, res, error): "error" | "warn" | "info" => {
        if (error || res.statusCode >= HttpStatus.InternalServerError) return "error"
        if (res.statusCode >= HttpStatus.BadRequest) return "warn"
        return "info"
    },
    customSuccessObject: (req, res, value) => ({
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: value.responseTime
    }),
    customErrorObject: (req, res, error, value) => ({
        method: req.method,
        path: req.originalUrl,
        err: error,
        statusCode: res.statusCode,
        responseTime: value.responseTime
    })
})

export { httpLogger, logger }
