import { Loan } from '../models/Loan';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

interface CreateLoanData {
  loanType: 'borrowed' | 'lent';
  counterparty: string;
  principal: number;
  interestRate?: number;
  interestType?: 'simple' | 'compound';
  startDate: Date;
  dueDate?: Date;
  emiAmount?: number;
  emiFrequency?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
}

interface RecordPaymentData {
  amount: number;
  date?: Date;
}

export class LoanService {
  async createLoan(userId: string, data: CreateLoanData) {
    const loan = await Loan.create({
      userId,
      ...data,
      remainingBalance: data.principal,
      status: 'active',
    });
    return loan;
  }

  async getLoans(userId: string, status?: 'active' | 'paid' | 'overdue' | 'cancelled') {
    const query: any = { userId };
    if (status) query.status = status;

    const loans = await Loan.find(query).sort({ createdAt: -1 });
    return loans;
  }

  async getLoanById(loanId: string, userId: string) {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return loan;
  }

  async updateLoan(loanId: string, userId: string, data: Partial<CreateLoanData>) {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (loan.status === 'paid' || loan.status === 'cancelled') {
      throw new Error('FORBIDDEN_ACTION');
    }

    Object.assign(loan, data);
    await loan.save();
    return loan;
  }

  async deleteLoan(loanId: string, userId: string) {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    await Loan.findByIdAndDelete(loanId);
  }

  async recordPayment(loanId: string, userId: string, data: RecordPaymentData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loan = await Loan.findOne({ _id: loanId, userId }).session(session);
      if (!loan) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      if (loan.status !== 'active' && loan.status !== 'overdue') {
        throw new Error('FORBIDDEN_ACTION');
      }

      const paymentAmount = data.amount;
      const paymentDate = data.date || new Date();

      // Calculate interest accrued
      const interest = this.calculateInterest(
        loan.remainingBalance,
        loan.interestRate,
        loan.interestType,
        loan.startDate,
        paymentDate
      );

      // Determine how much goes to interest vs principal
      let interestPaid = Math.min(paymentAmount, interest);
      let principalPaid = paymentAmount - interestPaid;

      // Update loan
      loan.remainingBalance -= principalPaid;
      loan.totalInterest += interestPaid;

      // Add payment record
      loan.payments.push({
        amount: paymentAmount,
        date: paymentDate,
        principalPaid,
        interestPaid,
      });

      // Update status
      if (loan.remainingBalance <= 0) {
        loan.status = 'paid';
        loan.remainingBalance = 0;
      }

      await loan.save({ session });

      // Create transaction record
      const loanCategory = await mongoose.model('Category').findOne({ name: 'Loan Payment', isDefault: true });
      if (loanCategory) {
        await Transaction.create(
          [
            {
              userId,
              type: 'debit',
              amount: paymentAmount,
              category: loanCategory._id,
              date: paymentDate,
              description: `Payment for ${loan.loanType} loan - ${loan.counterparty}`,
              metadata: {
                source: 'loan-payment',
                relatedId: loan._id,
              },
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return loan;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  calculateInterest(
    principal: number,
    rate: number,
    type: 'simple' | 'compound',
    startDate: Date,
    endDate: Date
  ): number {
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (type === 'simple') {
      return (principal * rate * years) / 100;
    } else {
      // Compound interest (annually)
      return principal * (Math.pow(1 + rate / 100, years) - 1);
    }
  }

  calculateEMI(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) {
      return principal / months;
    }

    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi * 100) / 100;
  }

  async checkOverdueLoans() {
    const now = new Date();
    const overdueLoans = await Loan.find({
      status: 'active',
      dueDate: { $lt: now },
    });

    for (const loan of overdueLoans) {
      loan.status = 'overdue';
      await loan.save();
    }

    return overdueLoans.length;
  }
}

export const loanService = new LoanService();
