import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/api';
export declare function authenticateToken(req: Request & AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
export declare function requireUserType(allowedTypes: string[]): (req: Request & AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map