"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const UserController_1 = require("../controllers/UserController");
const userSchemas_1 = require("../validation/userSchemas");
const router = express_1.default.Router();
exports.userRoutes = router;
const userController = new UserController_1.UserController();
router.post('/register', (0, validation_1.validateRequest)(userSchemas_1.userRegistrationSchema), userController.register.bind(userController));
router.use(auth_1.authenticateToken);
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', (0, validation_1.validateRequest)(userSchemas_1.updateUserProfileSchema), userController.updateProfile.bind(userController));
router.get('/profile/:userId', userController.getPublicProfile.bind(userController));
router.delete('/profile', userController.deleteProfile.bind(userController));
router.get('/', (0, auth_1.requireUserType)(['admin']), userController.getAllUsers.bind(userController));
router.put('/:userId/status', (0, auth_1.requireUserType)(['admin']), userController.updateUserStatus.bind(userController));
//# sourceMappingURL=users.js.map