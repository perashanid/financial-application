import mongoose, { Document, Schema } from 'mongoose';

export interface ISavingsGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  autoSaveRules: Array<{
    type: 'percentage' | 'roundup' | 'scheduled';
    value: number;
    frequency?: 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
  }>;
  contributions: Array<{
    amount: number;
    date: Date;
    source: 'manual' | 'auto-percentage' | 'auto-roundup' | 'auto-scheduled';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const savingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    targetDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    autoSaveRules: [
      {
        type: { type: String, enum: ['percentage', 'roundup', 'scheduled'], required: true },
        value: { type: Number, required: true },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
        isActive: { type: Boolean, default: true },
      },
    ],
    contributions: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        source: {
          type: String,
          enum: ['manual', 'auto-percentage', 'auto-roundup', 'auto-scheduled'],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

savingsGoalSchema.index({ userId: 1, status: 1 });

export const SavingsGoal = mongoose.model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);
