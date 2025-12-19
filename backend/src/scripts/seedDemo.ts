import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { Campaign } from '../models/Campaign';
import { Payment } from '../models/Payment';
import { ActivityLog } from '../models/ActivityLog';
import { SavingsGoal } from '../models/SavingsGoal';
import { Loan } from '../models/Loan';
import { Group } from '../models/Group';
import { Category, defaultCategories } from '../models/Category';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_USER = {
  email: 'demo@example.com',
  password: 'Demo123!',
  name: 'Demo User',
  role: 'individual' as const,
};

async function seedDemo() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-ledger';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing demo data
    await User.deleteOne({ email: DEMO_USER.email });
    console.log('Cleared existing demo user');

    // Create demo user
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
    const demoUser = await User.create({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash: hashedPassword,
      role: DEMO_USER.role,
      isVerified: true,
      isActive: true,
    });
    console.log('✓ Created demo user:', DEMO_USER.email);

    // Clear related data
    await Transaction.deleteMany({ userId: demoUser._id });
    await Notification.deleteMany({ userId: demoUser._id });
    await Campaign.deleteMany({ userId: demoUser._id });
    await Payment.deleteMany({ userId: demoUser._id });
    await ActivityLog.deleteMany({ userId: demoUser._id });
    await SavingsGoal.deleteMany({ userId: demoUser._id });
    await Loan.deleteMany({ userId: demoUser._id });
    await Group.deleteMany({ createdBy: demoUser._id });
    await Category.deleteMany({ userId: demoUser._id });

    // Create categories for demo user
    const categories = await Category.insertMany(
      defaultCategories.map(cat => ({ ...cat, userId: demoUser._id, isDefault: false }))
    );
    console.log(`✓ Created ${categories.length} categories`);

    // Helper to get category by name
    const getCategoryId = (name: string) => {
      const category = categories.find(c => c.name === name);
      return category?._id;
    };

    // Create transactions (last 3 months)
    const transactions = [];
    const now = new Date();
    
    // Monthly salary
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      transactions.push({
        userId: demoUser._id,
        type: 'credit',
        category: getCategoryId('Salary'),
        amount: 5000,
        description: 'Monthly salary',
        date,
      });
    }

    // Freelance income
    transactions.push(
      {
        userId: demoUser._id,
        type: 'credit',
        category: getCategoryId('Freelance'),
        amount: 1200,
        description: 'Website development project',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
      },
      {
        userId: demoUser._id,
        type: 'credit',
        category: getCategoryId('Freelance'),
        amount: 800,
        description: 'Logo design',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      }
    );

    // Regular expenses
    const expenseData = [
      { category: 'Rent', amount: 1500, description: 'Monthly rent', day: 1 },
      { category: 'Utilities', amount: 150, description: 'Electricity bill', day: 5 },
      { category: 'Utilities', amount: 80, description: 'Internet bill', day: 5 },
      { category: 'Food', amount: 250, description: 'Weekly groceries', day: 7 },
      { category: 'Food', amount: 180, description: 'Weekly groceries', day: 14 },
      { category: 'Food', amount: 220, description: 'Weekly groceries', day: 21 },
      { category: 'Transportation', amount: 120, description: 'Gas', day: 10 },
      { category: 'Transportation', amount: 45, description: 'Car wash', day: 15 },
      { category: 'Entertainment', amount: 60, description: 'Movie tickets', day: 12 },
      { category: 'Entertainment', amount: 85, description: 'Restaurant dinner', day: 18 },
      { category: 'Healthcare', amount: 200, description: 'Doctor visit', day: 8 },
      { category: 'Education', amount: 150, description: 'Online course', day: 3 },
    ];

    for (const expense of expenseData) {
      transactions.push({
        userId: demoUser._id,
        type: 'debit',
        category: getCategoryId(expense.category),
        amount: expense.amount,
        description: expense.description,
        date: new Date(now.getFullYear(), now.getMonth(), expense.day),
      });
    }

    // Add some pending transactions for future dates
    transactions.push(
      {
        userId: demoUser._id,
        type: 'debit',
        category: getCategoryId('Utilities'),
        amount: 95,
        description: 'Water bill',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      },
      {
        userId: demoUser._id,
        type: 'credit',
        category: getCategoryId('Freelance'),
        amount: 600,
        description: 'Consulting project',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      }
    );

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`✓ Created ${createdTransactions.length} transactions`);

    // Create savings goals
    const savingsGoals = await SavingsGoal.insertMany([
      {
        userId: demoUser._id,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 6500,
        deadline: new Date(now.getFullYear() + 1, 11, 31),
        status: 'active',
      },
      {
        userId: demoUser._id,
        name: 'Vacation to Europe',
        targetAmount: 5000,
        currentAmount: 2800,
        deadline: new Date(now.getFullYear(), 8, 1),
        status: 'active',
      },
      {
        userId: demoUser._id,
        name: 'New Laptop',
        targetAmount: 2000,
        currentAmount: 1500,
        deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1),
        status: 'active',
      },
    ]);
    console.log(`✓ Created ${savingsGoals.length} savings goals`);

    // Create loans
    const loans = await Loan.insertMany([
      {
        userId: demoUser._id,
        loanType: 'borrowed',
        counterparty: 'City Bank',
        principal: 15000,
        interestRate: 8.5,
        interestType: 'simple',
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        dueDate: new Date(now.getFullYear() + 2, 0, 1),
        status: 'active',
        remainingBalance: 10500,
        totalInterest: 3825,
        emiAmount: 472,
        emiFrequency: 'monthly',
        payments: [],
        reminders: [],
        notes: 'Personal loan for home renovation',
      },
      {
        userId: demoUser._id,
        loanType: 'borrowed',
        counterparty: 'Auto Finance Corp',
        principal: 25000,
        interestRate: 5.2,
        interestType: 'simple',
        startDate: new Date(now.getFullYear() - 2, 6, 15),
        dueDate: new Date(now.getFullYear() + 3, 6, 15),
        status: 'active',
        remainingBalance: 14200,
        totalInterest: 6500,
        emiAmount: 472,
        emiFrequency: 'monthly',
        payments: [],
        reminders: [],
        notes: 'Car loan',
      },
      {
        userId: demoUser._id,
        loanType: 'lent',
        counterparty: 'John Doe',
        principal: 5000,
        interestRate: 0,
        interestType: 'simple',
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 4, 1),
        status: 'active',
        remainingBalance: 3500,
        totalInterest: 0,
        payments: [],
        reminders: [],
        notes: 'Personal loan to friend',
      },
    ]);
    console.log(`✓ Created ${loans.length} loans`);

    // Create groups
    const groups = await Group.insertMany([
      {
        name: 'Family Budget',
        description: 'Shared family expenses',
        createdBy: demoUser._id,
        members: [
          { userId: demoUser._id, role: 'admin', joinedAt: new Date() }
        ],
        currency: 'BDT',
      },
      {
        name: 'Roommates',
        description: 'Apartment shared costs',
        createdBy: demoUser._id,
        members: [
          { userId: demoUser._id, role: 'admin', joinedAt: new Date() }
        ],
        currency: 'BDT',
      },
    ]);
    console.log(`✓ Created ${groups.length} groups`);

    // Create campaigns
    const campaigns = await Campaign.insertMany([
      {
        title: 'Home Down Payment',
        description: 'Saving for our first home. We are a young couple looking to buy our first house and need help with the down payment.',
        creatorId: demoUser._id,
        targetAmount: 50000,
        raisedAmount: 18500,
        currency: 'BDT',
        category: 'Housing',
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear() + 2, 5, 1),
        status: 'active',
        moderationStatus: 'approved',
        contributions: [],
        updates: [],
        flags: [],
      },
      {
        title: 'Wedding Fund',
        description: 'Dream wedding savings for our special day. Help us celebrate our love with family and friends.',
        creatorId: demoUser._id,
        targetAmount: 30000,
        raisedAmount: 12000,
        currency: 'BDT',
        category: 'Personal',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear() + 1, 8, 15),
        status: 'active',
        moderationStatus: 'approved',
        contributions: [],
        updates: [],
        flags: [],
      },
    ]);
    console.log(`✓ Created ${campaigns.length} campaigns`);

    // Create payments for campaigns
    const payments = [];
    const gateways: Array<'bkash' | 'nagad' | 'sslcommerz'> = ['bkash', 'nagad', 'sslcommerz'];
    
    for (const campaign of campaigns) {
      for (let i = 0; i < 5; i++) {
        const amount = Math.floor(Math.random() * 500) + 100;
        payments.push({
          userId: demoUser._id,
          gateway: gateways[Math.floor(Math.random() * gateways.length)],
          amount,
          currency: 'BDT',
          status: 'completed',
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          gatewayTransactionId: `GW${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          recipient: {
            type: 'campaign',
            id: campaign._id,
          },
          metadata: {
            purpose: 'Campaign contribution',
            relatedId: campaign._id,
          },
          completedAt: new Date(now.getFullYear(), now.getMonth() - i, Math.floor(Math.random() * 28) + 1),
        });
      }
    }
    await Payment.insertMany(payments);
    console.log(`✓ Created ${payments.length} payments`);

    // Create notifications
    const notifications = await Notification.insertMany([
      {
        userId: demoUser._id,
        type: 'security_alert',
        title: 'Welcome to Financial Ledger!',
        message: 'Your account has been set up with demo data. Explore all features!',
        isRead: false,
        channels: { inApp: true, email: false, sms: false },
      },
      {
        userId: demoUser._id,
        type: 'goal_reached',
        title: 'Savings Goal Deadline Approaching',
        message: 'Your "New Laptop" goal deadline is in 2 months',
        isRead: false,
        channels: { inApp: true, email: true, sms: false },
      },
      {
        userId: demoUser._id,
        type: 'campaign_contribution',
        title: 'Campaign Contribution Received',
        message: 'Someone contributed to your "Home Down Payment" campaign',
        isRead: true,
        readAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        channels: { inApp: true, email: false, sms: false },
      },
      {
        userId: demoUser._id,
        type: 'payment_due',
        title: 'Loan Payment Due',
        message: 'Your auto loan payment is due in 5 days',
        isRead: false,
        channels: { inApp: true, email: true, sms: true },
      },
      {
        userId: demoUser._id,
        type: 'loan_overdue',
        title: 'Loan Payment Reminder',
        message: 'Your personal loan payment of ৳472 is due soon',
        isRead: false,
        channels: { inApp: true, email: false, sms: false },
      },
    ]);
    console.log(`✓ Created ${notifications.length} notifications`);

    // Create activity logs
    const activityLogs = [
      {
        userId: demoUser._id,
        action: 'login',
        resource: 'auth',
        details: { method: 'email', success: true },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success' as const,
      },
      {
        userId: demoUser._id,
        action: 'create',
        resource: 'transaction',
        resourceId: createdTransactions[0]?._id,
        details: { type: 'debit', category: 'Food', amount: 250 },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success' as const,
      },
      {
        userId: demoUser._id,
        action: 'update',
        resource: 'savings_goal',
        resourceId: savingsGoals[0]?._id,
        details: { name: 'Emergency Fund', amount: 500 },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success' as const,
      },
      {
        userId: demoUser._id,
        action: 'create',
        resource: 'campaign',
        resourceId: campaigns[0]?._id,
        details: { title: 'Home Down Payment', targetAmount: 50000 },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success' as const,
      },
      {
        userId: demoUser._id,
        action: 'payment',
        resource: 'campaign',
        resourceId: campaigns[0]?._id,
        details: { amount: 500, gateway: 'bkash' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success' as const,
      },
    ];
    await ActivityLog.insertMany(activityLogs);
    console.log(`✓ Created ${activityLogs.length} activity logs`);

    console.log('\n=================================');
    console.log('Demo data seeded successfully!');
    console.log('=================================');
    console.log('\nDemo User Credentials:');
    console.log('Email:', DEMO_USER.email);
    console.log('Password:', DEMO_USER.password);
    console.log('\nYou can now login and test all features!');
    console.log('=================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemo();
