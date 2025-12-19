import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiTarget } from 'react-icons/fi';
import { analyticsService } from '../services/analyticsService';
import { transactionService } from '../services/transactionService';
import { DashboardSummary, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, transactionsRes] = await Promise.all([
          analyticsService.getDashboard(),
          transactionService.getTransactions({ limit: 5 }),
        ]);

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        }

        if (transactionsRes.success && transactionsRes.data) {
          setRecentTransactions(transactionsRes.data.transactions);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/app/transactions">
          <Button>Add Transaction</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.currentBalance || 0)}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <FiDollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalIncome || 0)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalExpenses || 0)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiTrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-blue-600">{summary?.savingsRate.toFixed(1) || 0}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiTarget className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" action={<Link to="/app/transactions" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All</Link>}>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'credit' ? (
                      <FiTrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <FiTrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
