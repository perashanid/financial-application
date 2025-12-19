import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  loanType: 'borrowed' | 'lent';
  counterparty: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'compound';
  startDate: Date;
  dueDate?: Date;
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  emiAmount?: number;
  emiFrequency?: 'monthly' | 'quarterly' | 'yearly';
  payments: Array<{
    amount: number;
    date: Date;
    transactionId?: mongoose.Types.ObjectId;
    principalPaid: number;
    interestPaid: number;
  }>;
  remainingBalance: number;
  totalInterest: number;
  notes?: string;
  reminders: Array<{
    date: Date;
    sent: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loanType: { type: String, enum: ['borrowed', 'lent'], required: true },
    counterparty: { type: String, required: true },
    principal: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, min: 0, max: 100, default: 0 },
    interestType: { type: String, enum: ['simple', 'compound'], default: 'simple' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['active', 'paid', 'overdue', 'cancelled'], default: 'active' },
    emiAmount: { type: Number },
    emiFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
        principalPaid: { type: Number, required: true },
        interestPaid: { type: Number, required: true },
      },
    ],
    remainingBalance: { type: Number, required: true },
    totalInterest: { type: Number, default: 0 },
    notes: { type: String },
    reminders: [
      {
        date: { type: Date, required: true },
        sent: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
