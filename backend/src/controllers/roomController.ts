import { Response, NextFunction } from 'express';
import Room from '../models/Room';
import Message from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginationMeta } from '../types';

// GET /api/rooms
export const getRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      Room.find({ isPrivate: false })
        .populate('createdBy', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Room.countDocuments({ isPrivate: false }),
    ]);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    const response: ApiResponse = { status: 'success', data: { rooms }, pagination };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// POST /api/rooms
export const createRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, isPrivate } = req.body;

    const room = await Room.create({
      name,
      description,
      isPrivate,
      createdBy: req.user?.id,
      participants: [req.user?.id],
    });

    const response: ApiResponse = { status: 'success', data: { room } };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms/:roomId/messages
export const getRoomMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const room = await Room.findById(roomId);
    if (!room) return next(new AppError('Room not found', 404));

    const [messages, total] = await Promise.all([
      Message.find({ roomId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ roomId }),
    ]);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    const response: ApiResponse = {
      status: 'success',
      data: { messages: messages.reverse() },
      pagination,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
