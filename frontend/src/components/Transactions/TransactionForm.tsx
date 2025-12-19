import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { transactionService } from '../../services/transactionService';
import { Transaction, Category, TransactionFormData } from '../../types';
import { transactionSchema } from '../../utils/validators';
import Input from '../Common/Input';
import Button from '../Common/Button';

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, categories, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category._id,
          date: new Date(transaction.date),
          description: transaction.description,
          notes: transaction.notes,
        }
      : {
          type: 'debit',
          date: new Date(),
        },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      if (transaction) {
        await transactionService.updateTransaction(transaction._id, data);
        toast.success('Transaction updated successfully');
      } else {
        await transactionService.createTransaction(data);
        toast.success('Transaction created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          {...register('type')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="debit">Expense</option>
          <option value="credit">Income</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
        placeholder="Enter amount"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      <Input
        label="Date"
        type="date"
        {...register('date', { valueAsDate: true })}
        error={errors.date?.message}
      />

      <Input
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Enter description (optional)"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add notes (optional)"
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {transaction ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
