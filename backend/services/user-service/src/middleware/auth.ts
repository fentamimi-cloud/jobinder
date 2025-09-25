import { Request, Response, NextFunction } from 'express';
import { auth } from '../../../../shared/config/firebase';
import { logger } from '../../../../shared/utils/logger';
import { AuthenticatedRequest } from '../../../../shared/types/api';

export async function authenticateToken(
  req: Request & AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        customClaims: decodedToken
      };
      
      next();
    } catch (tokenError) {
      logger.error('Token verification failed:', tokenError);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

export function requireUserType(allowedTypes: string[]) {
  return async (req: Request & AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    try {
      // Get user type from custom claims or database
      const userType = req.user.customClaims?.userType;

      if (!allowedTypes.includes(userType)) {
        res.status(403).json({
          success: false,
          message: `Access restricted to ${allowedTypes.join(' or ')} accounts`
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('User type authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
}
