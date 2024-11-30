import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { User } from '../entities/User.entity';

interface JwtUser extends Omit<User, 'password' | 'lastLogin'> {
  iat?: number;
  exp?: number;
  lastLogin?: Date;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('未提供認證令牌', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtUser;
    req.user = decoded;
    
    next();
  } catch (error) {
    next(new AppError('無效的認證令牌', 401));
  }
}; 