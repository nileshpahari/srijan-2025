import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  senderEmail: string;
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  name: string;
  type: 'individual' | 'group';
  participants: string[];
  messages: IMessage[];
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  senderEmail: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema<IConversation>({
  name: { type: String, required: true },
  type: { type: String, enum: ['individual', 'group'], required: true },
  participants: [{ type: String, required: true }],
  messages: [MessageSchema],
  lastMessage: { type: String },
  lastMessageTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);