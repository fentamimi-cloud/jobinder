import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Skip logging for health checks
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
      logger.warn('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
}
