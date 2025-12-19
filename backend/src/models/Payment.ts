import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  gateway: 'bkash' | 'nagad' | 'sslcommerz';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  recipient?: {
    type: 'user' | 'campaign' | 'group';
    id: mongoose.Types.ObjectId;
  };
  metadata?: {
    purpose?: string;
    relatedId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  failureReason?: string;
  refundedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gateway: { type: String, enum: ['bkash', 'nagad', 'sslcommerz'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, unique: true, sparse: true },
    gatewayTransactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    recipient: {
      type: {
        type: String,
        enum: ['user', 'campaign', 'group'],
      },
      id: { type: Schema.Types.ObjectId },
    },
    metadata: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    refundedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
