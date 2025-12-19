import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { loanService } from '../services/loanService';
import { Loan } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    loanType: 'borrowed' as 'borrowed' | 'lent',
    counterparty: '',
    principal: '',
    interestRate: '',
    interestType: 'simple' as 'simple' | 'compound',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getLoans();
      if (response.success && response.data) {
        setLoans(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loanService.createLoan({
        loanType: formData.loanType,
        counterparty: formData.counterparty,
        principal: parseFloat(formData.principal),
        interestRate: parseFloat(formData.interestRate),
        interestType: formData.interestType,
        startDate: new Date(formData.startDate),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        notes: formData.notes,
      });
      toast.success('Loan created successfully');
      setIsModalOpen(false);
      setFormData({
        loanType: 'borrowed',
        counterparty: '',
        principal: '',
        interestRate: '',
        interestType: 'simple',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      });
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create loan');
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      await loanService.makePayment(selectedLoan._id, parseFloat(paymentAmount));
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setSelectedLoan(null);
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to record payment');
    }
  };

  const openPaymentModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loans & Debts</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="inline mr-2" />
          Add Loan
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <Card key={loan._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{loan.counterparty}</h3>
                    <p className="text-sm text-gray-500">
                      {loan.loanType === 'borrowed' ? 'Borrowed from' : 'Lent to'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      loan.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : loan.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Principal</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.principal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(loan.remainingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.totalInterest)}</p>
                  </div>
                </div>

                {loan.dueDate && (
                  <p className="text-sm text-gray-500">Due: {formatDate(loan.dueDate)}</p>
                )}

                <Button variant="secondary" size="sm" className="w-full" onClick={() => openPaymentModal(loan)}>
                  Make Payment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Loan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Loan">
        <form onSubmit={handleCreateLoan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
            <select
              value={formData.loanType}
              onChange={(e) => setFormData({ ...formData, loanType: e.target.value as 'borrowed' | 'lent' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="borrowed">Borrowed (I owe)</option>
              <option value="lent">Lent (They owe me)</option>
            </select>
          </div>

          <Input
            label={formData.loanType === 'borrowed' ? 'Borrowed From' : 'Lent To'}
            value={formData.counterparty}
            onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
            placeholder="Person or organization name"
            required
          />

          <Input
            label="Principal Amount"
            type="number"
            value={formData.principal}
            onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
            placeholder="0.00"
            step="0.01"
            required
          />

          <Input
            label="Interest Rate (%)"
            type="number"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="0.00"
            step="0.01"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Type</label>
            <select
              value={formData.interestType}
              onChange={(e) => setFormData({ ...formData, interestType: e.target.value as 'simple' | 'compound' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="simple">Simple Interest</option>
              <option value="compound">Compound Interest</option>
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />

          <Input
            label="Due Date (Optional)"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Loan</Button>
          </div>
        </form>
      </Modal>

      {/* Make Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedLoan(null);
          setPaymentAmount('');
        }}
        title={`Make Payment - ${selectedLoan?.counterparty}`}
      >
        <form onSubmit={handleMakePayment} className="space-y-4">
          <Input
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
          />

          {selectedLoan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="font-medium text-red-600">{formatCurrency(selectedLoan.remainingBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium">{formatCurrency(selectedLoan.totalInterest)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedLoan(null);
                setPaymentAmount('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Loans;
