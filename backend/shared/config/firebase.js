"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.storage = exports.auth = exports.firestore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const storage_1 = require("firebase-admin/storage");
if (!firebase_admin_1.default.apps.length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (process.env.NODE_ENV === 'development' && !serviceAccountPath) {
        process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082';
        process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
        firebase_admin_1.default.initializeApp({
            projectId: projectId || 'demo-project',
        });
    }
    else {
        const serviceAccount = serviceAccountPath
            ? require(serviceAccountPath)
            : {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            projectId: projectId,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
}
exports.firestore = (0, firestore_1.getFirestore)();
exports.auth = (0, auth_1.getAuth)();
exports.storage = (0, storage_1.getStorage)();
exports.firestore.settings({
    ignoreUndefinedProperties: true,
});
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map