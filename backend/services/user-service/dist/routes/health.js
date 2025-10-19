"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const firebase_1 = require("../../../../shared/config/firebase");
const router = express_1.default.Router();
exports.healthRoutes = router;
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User service is healthy',
        timestamp: new Date().toISOString(),
        service: 'user-service',
        version: process.env.npm_package_version || '1.0.0',
    });
});
router.get('/ready', async (req, res) => {
    try {
        await firebase_1.firestore.doc('health/check').get();
        res.status(200).json({
            success: true,
            message: 'User service is ready',
            timestamp: new Date().toISOString(),
            checks: {
                firestore: 'healthy',
            },
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            message: 'User service is not ready',
            timestamp: new Date().toISOString(),
            checks: {
                firestore: 'unhealthy',
            },
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
//# sourceMappingURL=health.js.map