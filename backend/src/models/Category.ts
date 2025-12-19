import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameLocal?: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    nameLocal: { type: String },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String },
    color: { type: String },
    isDefault: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1 });
categorySchema.index({ type: 1, isDefault: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);

export const defaultCategories = [
  // Income categories
  { name: 'Salary', nameLocal: 'বেতন', type: 'income', icon: '💰', color: '#10b981', isDefault: true },
  { name: 'Business', nameLocal: 'ব্যবসা', type: 'income', icon: '💼', color: '#3b82f6', isDefault: true },
  { name: 'Investment', nameLocal: 'বিনিয়োগ', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true },
  { name: 'Freelance', nameLocal: 'ফ্রিল্যান্স', type: 'income', icon: '💻', color: '#06b6d4', isDefault: true },
  { name: 'Gift', nameLocal: 'উপহার', type: 'income', icon: '🎁', color: '#ec4899', isDefault: true },
  { name: 'Other Income', nameLocal: 'অন্যান্য আয়', type: 'income', icon: '💵', color: '#14b8a6', isDefault: true },
  
  // Expense categories
  { name: 'Savings', nameLocal: 'সঞ্চয়', type: 'expense', icon: '🏦', color: '#10b981', isDefault: true },
  { name: 'Food', nameLocal: 'খাবার', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
  { name: 'Rent', nameLocal: 'ভাড়া', type: 'expense', icon: '🏠', color: '#f59e0b', isDefault: true },
  { name: 'Utilities', nameLocal: 'ইউটিলিটি', type: 'expense', icon: '⚡', color: '#eab308', isDefault: true },
  { name: 'Transportation', nameLocal: 'পরিবহন', type: 'expense', icon: '🚗', color: '#06b6d4', isDefault: true },
  { name: 'Healthcare', nameLocal: 'স্বাস্থ্যসেবা', type: 'expense', icon: '🏥', color: '#ec4899', isDefault: true },
  { name: 'Education', nameLocal: 'শিক্ষা', type: 'expense', icon: '📚', color: '#8b5cf6', isDefault: true },
  { name: 'Entertainment', nameLocal: 'বিনোদন', type: 'expense', icon: '🎬', color: '#f43f5e', isDefault: true },
  { name: 'Shopping', nameLocal: 'কেনাকাটা', type: 'expense', icon: '🛍️', color: '#a855f7', isDefault: true },
  { name: 'Loan Payment', nameLocal: 'ঋণ পরিশোধ', type: 'expense', icon: '💳', color: '#dc2626', isDefault: true },
  { name: 'Insurance', nameLocal: 'বীমা', type: 'expense', icon: '🛡️', color: '#0891b2', isDefault: true },
  { name: 'Other Expense', nameLocal: 'অন্যান্য খরচ', type: 'expense', icon: '💸', color: '#64748b', isDefault: true },
];
