import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  lastTransactionDate?: Date;
  totalTransactions: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['person', 'organization'],
      default: 'person',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [String],
    lastTransactionDate: Date,
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({ userId: 1, name: 1 });
contactSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IContact>('Contact', contactSchema);
