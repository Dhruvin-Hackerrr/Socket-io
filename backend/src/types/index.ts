import { Request } from 'express';
import { JwtPayload } from '../utils/jwt';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Socket event payloads
export interface JoinRoomPayload {
  roomId: string;
  username: string;
}

export interface SendMessagePayload {
  roomId: string;
  message: string;
  senderId: string;
  senderName: string;
  type?: 'text' | 'image' | 'file';
}

export interface ReceiveMessagePayload extends SendMessagePayload {
  messageId: string;
  timestamp: string;
}

export interface UserStatus {
  userId: string;
  username: string;
  status: 'online' | 'offline' | 'away';
}
