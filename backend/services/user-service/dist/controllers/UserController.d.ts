import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        emailVerified: boolean;
        customClaims?: any;
    };
}
export declare class UserController {
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=UserController.d.ts.map