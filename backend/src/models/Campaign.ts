import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  category: string;
  images?: string[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  contributions: Array<{
    userId: mongoose.Types.ObjectId;
    amount: number;
    paymentId: mongoose.Types.ObjectId;
    date: Date;
    isAnonymous: boolean;
  }>;
  updates: Array<{
    title: string;
    content: string;
    date: Date;
  }>;
  flags: Array<{
    userId: mongoose.Types.ObjectId;
    reason: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'BDT' },
    category: { type: String, required: true },
    images: [{ type: String }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'draft',
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    moderationNotes: { type: String },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    contributions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
        date: { type: Date, default: Date.now },
        isAnonymous: { type: Boolean, default: false },
      },
    ],
    updates: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    flags: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

campaignSchema.index({ creatorId: 1 });
campaignSchema.index({ status: 1, moderationStatus: 1 });
campaignSchema.index({ endDate: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
