"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../../../../shared/utils/logger");
function errorHandler(error, req, res, next) {
    logger_1.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    let statusCode = 500;
    let message = 'Internal server error';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (error.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
    }
    if (error.code === 'auth/id-token-expired') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.code === 'auth/id-token-revoked') {
        statusCode = 401;
        message = 'Token revoked';
    }
    const response = {
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
    res.status(statusCode).json(response);
}
//# sourceMappingURL=errorHandler.js.map