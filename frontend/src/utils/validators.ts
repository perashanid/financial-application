import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['individual', 'business']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const transactionSchema = z.object({
  type: z.enum(['debit', 'credit']),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetDate: z.date().optional(),
});

export const loanSchema = z.object({
  loanType: z.enum(['borrowed', 'lent']),
  counterparty: z.string().min(2, 'Counterparty name is required'),
  principal: z.number().positive('Principal must be positive'),
  interestRate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  interestType: z.enum(['simple', 'compound']),
  startDate: z.date(),
  dueDate: z.date().optional(),
  emiAmount: z.number().optional(),
  emiFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  notes: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  goalAmount: z.number().positive('Goal amount must be positive'),
  visibility: z.enum(['public', 'private']),
  category: z.string().optional(),
  endDate: z.date().optional(),
});
