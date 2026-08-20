import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

interface DecodedToken {
  id: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Retrieve the token from cookies
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is missing. Please log in.',
        },
      });
      return;
    }

    // 2. Verify token validity
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_passphrase_32_chars';
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // 3. Find associated User and omit password details
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with this token no longer exists.',
        },
      });
      return;
    }

    // 4. Attach user instance onto the request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Your session has expired or is invalid. Please log in again.',
      },
    });
  }
};
