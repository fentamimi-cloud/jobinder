import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../../../../shared/utils/logger';

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', error.details);
      
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
