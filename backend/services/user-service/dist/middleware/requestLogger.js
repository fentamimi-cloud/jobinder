"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../../../../shared/utils/logger");
function requestLogger(req, res, next) {
    const start = Date.now();
    if (req.path === '/health' || req.path === '/health/ready') {
        return next();
    }
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        };
        if (res.statusCode >= 400) {
            logger_1.logger.warn('HTTP Request Error', logData);
        }
        else {
            logger_1.logger.info('HTTP Request', logData);
        }
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map