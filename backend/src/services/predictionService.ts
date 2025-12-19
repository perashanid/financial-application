import { Transaction } from '../models/Transaction';
import { Loan } from '../models/Loan';
import mongoose from 'mongoose';

export class PredictionService {
  async predictExpenses(userId: string, months: number = 3) {
    // Get historical data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'debit',
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    if (monthlyExpenses.length < 3) {
      return {
        predictions: [],
        confidence: 'low',
        message: 'Insufficient data for prediction. Need at least 3 months of data.',
      };
    }

    // Simple linear regression
    const n = monthlyExpenses.length;
    const expenses = monthlyExpenses.map((m) => m.total);
    
    // Calculate average and trend
    const average = expenses.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate trend using simple moving average
    const recentAverage = expenses.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const trend = recentAverage - average;

    // Generate predictions
    const predictions = [];
    for (let i = 1; i <= months; i++) {
      const predicted = recentAverage + (trend * i);
      predictions.push({
        month: i,
        predictedAmount: Math.max(0, Math.round(predicted * 100) / 100),
      });
    }

    // Calculate confidence based on variance
    const variance = expenses.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / average) * 100;

    let confidence: 'low' | 'medium' | 'high';
    if (coefficientOfVariation < 20) {
      confidence = 'high';
    } else if (coefficientOfVariation < 40) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      predictions,
      confidence,
      historicalAverage: Math.round(average * 100) / 100,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trendAmount: Math.round(Math.abs(trend) * 100) / 100,
    };
  }

  async estimateLoanPayoff(loanId: string, userId: string) {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (loan.status === 'paid') {
      return {
        status: 'paid',
        message: 'Loan is already paid off',
      };
    }

    const remainingBalance = loan.remainingBalance;
    const interestRate = loan.interestRate;

    // Calculate average payment amount from history
    const payments = loan.payments;
    if (payments.length === 0) {
      return {
        estimatedMonths: null,
        estimatedPayoffDate: null,
        totalInterest: loan.totalInterest,
        message: 'No payment history available',
      };
    }

    const avgPayment = payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;

    // Calculate months to payoff with interest
    let balance = remainingBalance;
    let months = 0;
    let totalInterest = loan.totalInterest;
    const monthlyRate = interestRate / 12 / 100;

    while (balance > 0 && months < 600) { // Max 50 years
      const interestThisMonth = balance * monthlyRate;
      totalInterest += interestThisMonth;
      
      const principalPayment = Math.min(avgPayment - interestThisMonth, balance);
      balance -= principalPayment;
      months++;

      if (avgPayment <= interestThisMonth) {
        return {
          estimatedMonths: null,
          estimatedPayoffDate: null,
          message: 'Payment amount is too low to cover interest. Loan will not be paid off.',
        };
      }
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    return {
      estimatedMonths: months,
      estimatedPayoffDate: payoffDate,
      totalInterestEstimate: Math.round(totalInterest * 100) / 100,
      averageMonthlyPayment: Math.round(avgPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
    };
  }

  async predictSavingsGrowth(userId: string, months: number = 12) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get historical savings contributions
    const savingsTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          'metadata.source': { $in: ['auto-save', 'auto-percentage', 'auto-roundup', 'auto-scheduled'] },
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    if (savingsTransactions.length < 2) {
      return {
        predictions: [],
        confidence: 'low',
        message: 'Insufficient savings history for prediction',
      };
    }

    const avgMonthlySavings = savingsTransactions.reduce((sum, m) => sum + m.total, 0) / savingsTransactions.length;

    const predictions = [];
    let cumulativeSavings = 0;

    for (let i = 1; i <= months; i++) {
      cumulativeSavings += avgMonthlySavings;
      predictions.push({
        month: i,
        predictedSavings: Math.round(cumulativeSavings * 100) / 100,
        monthlyContribution: Math.round(avgMonthlySavings * 100) / 100,
      });
    }

    return {
      predictions,
      averageMonthlySavings: Math.round(avgMonthlySavings * 100) / 100,
      confidence: savingsTransactions.length >= 6 ? 'high' : 'medium',
    };
  }
}

export const predictionService = new PredictionService();
