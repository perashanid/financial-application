import { Payment } from '../models/Payment';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';
import crypto from 'crypto';

interface InitiatePaymentData {
  gateway: 'bkash' | 'nagad' | 'sslcommerz';
  amount: number;
  recipient?: {
    type: 'user' | 'campaign' | 'group';
    id: string;
  };
  metadata?: any;
}

export class PaymentService {
  async initiatePayment(userId: string, data: InitiatePaymentData) {
    const transactionId = this.generateTransactionId();

    const payment = await Payment.create({
      userId,
      gateway: data.gateway,
      amount: data.amount,
      currency: 'BDT',
      status: 'pending',
      transactionId,
      recipient: data.recipient,
      metadata: data.metadata,
    });

    // Gateway-specific initialization would go here
    // For now, return payment details
    return {
      paymentId: payment._id,
      transactionId,
      amount: payment.amount,
      gateway: payment.gateway,
      // In production, this would include gateway-specific redirect URLs
    };
  }

  async getPaymentById(paymentId: string, userId: string) {
    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return payment;
  }

  async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments({ userId }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async verifyPayment(paymentId: string, gatewayResponse: any) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    payment.status = 'processing';
    payment.gatewayResponse = gatewayResponse;
    payment.gatewayTransactionId = gatewayResponse.transactionId || gatewayResponse.trxID;
    await payment.save();

    // Gateway-specific verification would go here
    // For now, mark as completed
    return this.completePayment(String(payment._id));
  }

  async completePayment(paymentId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save({ session });

      // Create transaction record
      const category = await mongoose.model('Category').findOne({ name: 'Other Expense', isDefault: true });
      if (category) {
        await Transaction.create(
          [
            {
              userId: payment.userId,
              type: 'debit',
              amount: payment.amount,
              category: category._id,
              date: new Date(),
              description: `Payment via ${payment.gateway}`,
              metadata: {
                source: 'payment',
                relatedId: payment._id,
              },
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async failPayment(paymentId: string, reason: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    payment.status = 'failed';
    payment.failureReason = reason;
    await payment.save();

    return payment;
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = crypto.randomBytes(6).toString('hex');
    return `TXN${timestamp}${randomStr}`.toUpperCase();
  }
}

export const paymentService = new PaymentService();
