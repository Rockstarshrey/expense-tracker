'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import Navbar from '@/components/Navbar';
import ExpenseSummary from '@/components/ExpenseSummary';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';

const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Other'];

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses(
    selectedCategory !== 'All' ? selectedCategory : undefined,
    selectedMonth
  );

  const handleAddExpense = async (expenseData: {
    amount: number;
    category: string;
    date: string;
    description?: string;
  }) => {
    return await addExpense(expenseData);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleUpdateExpense = async (expenseData: {
    amount: number;
    category: 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other';
    date: string;
    description?: string;
  }) => {
    if (!editingExpense) {
      return { success: false, error: 'No expense being edited' };
    }

    const result = await updateExpense(editingExpense._id, expenseData);
    if (result.success) {
      setEditingExpense(null);
      setIsFormOpen(false);
    }
    return result;
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">Error loading expenses</div>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage your expenses
            </p>
          </div>

          {/* Filters and Add Button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  id="month-filter"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Expense
            </button>
          </div>

          {/* Summary and Expenses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Card */}
            <div className="lg:col-span-1">
              <ExpenseSummary
                expenses={expenses}
                selectedMonth={selectedMonth}
              />
            </div>

            {/* Expenses List */}
            <div className="lg:col-span-2">
              <ExpenseList
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        editingExpense={editingExpense}
      />
    </div>
  );
}