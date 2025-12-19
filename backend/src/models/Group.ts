import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    balance: number;
    isActive: boolean;
  }>;
  bills: Array<{
    description: string;
    totalAmount: number;
    paidBy: mongoose.Types.ObjectId;
    date: Date;
    splits: Array<{
      userId: mongoose.Types.ObjectId;
      amount: number;
      isPaid: boolean;
      paidAt?: Date;
    }>;
    createdAt: Date;
  }>;
  settlements: Array<{
    from: mongoose.Types.ObjectId;
    to: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    transactionId?: mongoose.Types.ObjectId;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        balance: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    bills: [
      {
        description: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, default: Date.now },
        splits: [
          {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            isPaid: { type: Boolean, default: false },
            paidAt: { type: Date },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    settlements: [
      {
        from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ createdBy: 1 });

export const Group = mongoose.model<IGroup>('Group', groupSchema);
