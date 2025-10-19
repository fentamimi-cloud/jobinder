"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireUserType = requireUserType;
const firebase_1 = require("../../../../shared/config/firebase");
const logger_1 = require("../../../../shared/utils/logger");
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decodedToken = await firebase_1.auth.verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
                customClaims: decodedToken
            };
            next();
        }
        catch (tokenError) {
            logger_1.logger.error('Token verification failed:', tokenError);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}
function requireUserType(allowedTypes) {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        try {
            const userType = req.user.customClaims?.userType;
            if (!allowedTypes.includes(userType)) {
                res.status(403).json({
                    success: false,
                    message: `Access restricted to ${allowedTypes.join(' or ')} accounts`
                });
                return;
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('User type authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Authorization failed'
            });
        }
    };
}
//# sourceMappingURL=auth.js.map