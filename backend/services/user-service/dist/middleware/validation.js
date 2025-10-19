"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const logger_1 = require("../../../../shared/utils/logger");
function validateRequest(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            logger_1.logger.warn('Validation error:', error.details);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    code: detail.type
                }))
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=validation.js.map