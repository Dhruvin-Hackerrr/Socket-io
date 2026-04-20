import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId | string;
  sender: mongoose.Types.ObjectId | string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient room message queries
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
