'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expenseData: {
    amount: number;
    category: 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other';
    date: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  editingExpense?: Expense | null;
}

const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'] as const;

export default function ExpenseForm({ isOpen, onClose, onSubmit, editingExpense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Other' as 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or editing expense changes
  useEffect(() => {
    if (isOpen && editingExpense) {
      setFormData({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: format(new Date(editingExpense.date), 'yyyy-MM-dd'),
        description: editingExpense.description || '',
      });
    } else if (isOpen) {
      setFormData({
        amount: '',
        category: 'Other',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      });
    }
    setError('');
  }, [isOpen, editingExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

    // Validate date (don't allow future dates)
    const expenseDate = new Date(formData.date);
    if (expenseDate > new Date()) {
      setError('Date cannot be in the future');
      setLoading(false);
      return;
    }

    const result = await onSubmit({
      amount,
      category: formData.category,
      date: formData.date,
      description: formData.description.trim() || undefined,
    });

    if (result.success) {
      onClose();
      setFormData({
        amount: '',
        category: 'Other',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      });
    } else {
      setError(result.error || 'Failed to save expense');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                max={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Add') }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}