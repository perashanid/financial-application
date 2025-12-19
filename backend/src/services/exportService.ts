import { Transaction } from '../models/Transaction';
import PDFDocument from 'pdfkit';

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'debit' | 'credit';
}

export class ExportService {
  async exportTransactionsCSV(userId: string, filters: ExportFilters = {}): Promise<string> {
    const query: any = { userId };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.category) query.category = filters.category;
    if (filters.type) query.type = filters.type;

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .sort({ date: -1 })
      .lean();

    // Manual CSV generation
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Notes'];
    const rows = transactions.map((txn: any) => [
      new Date(txn.date).toLocaleDateString(),
      txn.type,
      txn.amount.toString(),
      txn.category?.name || 'N/A',
      txn.description || '',
      txn.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  async generateMonthlyReportPDF(userId: string, month: number, year: number): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('category', 'name')
      .sort({ date: -1 });

    // Calculate summary
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: transactions.length,
    };

    const categoryBreakdown: any = {};

    transactions.forEach((txn) => {
      if (txn.type === 'credit') {
        summary.totalIncome += txn.amount;
      } else {
        summary.totalExpenses += txn.amount;
      }

      const categoryName = (txn.category as any)?.name || 'Uncategorized';
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = 0;
      }
      categoryBreakdown[categoryName] += txn.amount;
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;

    // Generate PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Monthly Financial Report', { align: 'center' });
      doc.fontSize(12).text(`${this.getMonthName(month)} ${year}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(16).text('Summary', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Income: BDT ${summary.totalIncome.toFixed(2)}`);
      doc.text(`Total Expenses: BDT ${summary.totalExpenses.toFixed(2)}`);
      doc.text(`Balance: BDT ${summary.balance.toFixed(2)}`);
      doc.text(`Total Transactions: ${summary.transactionCount}`);
      doc.moveDown();

      // Category Breakdown
      doc.fontSize(16).text('Category Breakdown', { underline: true });
      doc.fontSize(12);
      Object.entries(categoryBreakdown).forEach(([category, amount]) => {
        doc.text(`${category}: BDT ${(amount as number).toFixed(2)}`);
      });
      doc.moveDown();

      // Transactions
      doc.fontSize(16).text('Transactions', { underline: true });
      doc.fontSize(10);

      transactions.slice(0, 50).forEach((txn) => {
        const date = new Date(txn.date).toLocaleDateString();
        const type = txn.type === 'credit' ? '+' : '-';
        const category = (txn.category as any)?.name || 'N/A';
        doc.text(
          `${date} | ${type}BDT ${txn.amount.toFixed(2)} | ${category} | ${txn.description || 'N/A'}`
        );
      });

      if (transactions.length > 50) {
        doc.text(`... and ${transactions.length - 50} more transactions`);
      }

      doc.end();
    });
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }
}

export const exportService = new ExportService();
