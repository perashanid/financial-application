import React, { useEffect, useState } from 'react';
import { FiPlus, FiTarget } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { savingsService } from '../services/savingsService';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';

const Savings: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  });
  const [contributeAmount, setContributeAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await savingsService.getGoals();
      if (response.success && response.data) {
        setGoals(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch savings goals');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (goal: SavingsGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savingsService.createGoal({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      });
      toast.success('Savings goal created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', targetAmount: '', targetDate: '' });
      fetchGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create goal');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await savingsService.contribute(selectedGoal._id, parseFloat(contributeAmount));
      toast.success('Contribution added successfully');
      setIsContributeModalOpen(false);
      setContributeAmount('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to add contribution');
    }
  };

  const openContributeModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="inline mr-2" />
          Create Goal
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : goals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiTarget className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No savings goals</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new savings goal.</p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)}>Create Goal</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      goal.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getProgress(goal), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{getProgress(goal).toFixed(1)}% Complete</p>
                </div>

                {goal.targetDate && (
                  <p className="text-sm text-gray-500">Target: {formatDate(goal.targetDate)}</p>
                )}

                <Button variant="secondary" size="sm" className="w-full" onClick={() => openContributeModal(goal)}>
                  Contribute
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Savings Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setSelectedGoal(null);
          setContributeAmount('');
        }}
        title={`Contribute to ${selectedGoal?.name}`}
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          {selectedGoal && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Current:</span>
                <span className="font-medium">{formatCurrency(selectedGoal.currentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Target:</span>
                <span className="font-medium">{formatCurrency(selectedGoal.targetAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-medium text-indigo-600">
                  {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsContributeModalOpen(false);
                setSelectedGoal(null);
                setContributeAmount('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Contribution</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Savings;
