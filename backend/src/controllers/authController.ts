import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt';
import { AuthRequest, ApiResponse } from '../types';

// POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    const user = await User.create({ name, email, password });

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

    const response: ApiResponse = {
      status: 'success',
      data: { user, token },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Contact support.', 403));
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

    const response: ApiResponse = {
      status: 'success',
      data: { user, token },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};
