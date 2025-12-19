import React, { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { MonthlyTrend, CategoryBreakdown } from '../types';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/Common/Card';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics: React.FC = () => {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendsRes, categoryRes] = await Promise.all([
        analyticsService.getTrends(6),
        analyticsService.getCategoryBreakdown('expense'),
      ]);

      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data);
      } else {
        console.error('Trends response:', trendsRes);
      }

      if (categoryRes.success && categoryRes.data) {
        setCategoryData(categoryRes.data);
      } else {
        console.error('Category response:', categoryRes);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const hasData = trends.length > 0 || categoryData.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {!hasData ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available yet. Start adding transactions to see insights.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Monthly Trends */}
          {trends.length > 0 && (
            <Card title="Monthly Trends">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="savings" stroke="#4F46E5" strokeWidth={2} name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <Card title="Expense by Category">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))} 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {categoryData.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
