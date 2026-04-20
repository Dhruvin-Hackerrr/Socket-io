import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import { SendMessagePayload, JoinRoomPayload } from '../types';
import logger from '../utils/logger';

// Track online users per room
const roomParticipants = new Map<string, Set<string>>();

export const initializeSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // ── JOIN ROOM ──────────────────────────────────────────────
    socket.on('join_room', async ({ roomId, username }: JoinRoomPayload) => {
      socket.data.username = username;
      socket.data.roomId = roomId;

      await socket.join(roomId);

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId)!.add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.id,
        username,
        roomId,
        timestamp: new Date().toISOString(),
      });

      // Send current participant count
      io.to(roomId).emit('room_participants', {
        roomId,
        count: roomParticipants.get(roomId)!.size,
      });

      logger.info(`${username} (${socket.id}) joined room ${roomId}`);
    });

    // ── SEND MESSAGE ───────────────────────────────────────────
    socket.on('send_message', async (data: SendMessagePayload) => {
      try {
        // Persist to DB
        const saved = await Message.create({
          roomId: data.roomId,
          sender: data.senderId,
          senderName: data.senderName,
          content: data.message,
          type: data.type || 'text',
        });

        const outgoing = {
          messageId: saved._id.toString(),
          roomId: data.roomId,
          message: data.message,
          senderId: data.senderId,
          sender: data.senderName,
          type: data.type || 'text',
          timestamp: saved.createdAt.toISOString(),
        };

        io.to(data.roomId).emit('receive_message', outgoing);
      } catch (error) {
        logger.error(`Failed to save message: ${(error as Error).message}`);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // ── TYPING INDICATOR ───────────────────────────────────────
    socket.on('typing_start', ({ roomId, username }: { roomId: string; username: string }) => {
      socket.to(roomId).emit('user_typing', { username, isTyping: true });
    });

    socket.on('typing_stop', ({ roomId, username }: { roomId: string; username: string }) => {
      socket.to(roomId).emit('user_typing', { username, isTyping: false });
    });

    // ── LEAVE ROOM ─────────────────────────────────────────────
    socket.on('leave_room', ({ roomId }: { roomId: string }) => {
      handleLeaveRoom(socket, io, roomId);
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (roomId) handleLeaveRoom(socket, io, roomId);
      logger.info(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

function handleLeaveRoom(socket: Socket, io: Server, roomId: string): void {
  socket.leave(roomId);

  const participants = roomParticipants.get(roomId);
  if (participants) {
    participants.delete(socket.id);
    if (participants.size === 0) roomParticipants.delete(roomId);
  }

  socket.to(roomId).emit('user_left', {
    userId: socket.id,
    username: socket.data.username,
    roomId,
    timestamp: new Date().toISOString(),
  });

  io.to(roomId).emit('room_participants', {
    roomId,
    count: roomParticipants.get(roomId)?.size ?? 0,
  });
}
