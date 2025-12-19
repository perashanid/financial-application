import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'debit' | 'credit';
  amount: number;
  category: mongoose.Types.ObjectId;
  date: Date;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  metadata?: {
    source: 'manual' | 'auto-save' | 'loan-payment' | 'group-bill';
    relatedId?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: true, index: true },
    description: { type: String },
    notes: { type: String },
    receiptUrl: { type: String },
    receiptPublicId: { type: String },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
    recurringRule: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      interval: { type: Number },
      endDate: { type: Date },
    },
    metadata: {
      source: { type: String, enum: ['manual', 'auto-save', 'loan-payment', 'group-bill'], default: 'manual' },
      relatedId: { type: Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

// Indexes for performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
