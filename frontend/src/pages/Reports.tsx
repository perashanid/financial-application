import React, { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

const Reports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('transactions');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleGenerate = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select date range');
      return;
    }

    setIsGenerating(true);
    try {
      // API call to generate report
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>

      <Card title="Generate Report">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="transactions">All Transactions</option>
              <option value="monthly-summary">Monthly Summary</option>
              <option value="category-breakdown">Category Breakdown</option>
              <option value="savings">Savings Report</option>
              <option value="loans">Loans Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                PDF
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                CSV
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
            <FiDownload className="inline mr-2" />
            Generate Report
          </Button>
        </div>
      </Card>

      <Card title="Recent Reports">
        <div className="space-y-3">
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No reports generated yet</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
