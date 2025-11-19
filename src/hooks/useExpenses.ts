'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other';
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

export function useExpenses(category?: string, month?: string) {
  const [state, setState] = useState<ExpensesState>({
    expenses: [],
    loading: true,
    error: null,
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams();
      if (category && category !== 'All') {
        params.append('category', category);
      }
      if (month) {
        params.append('month', month);
      }

      const response = await fetch(`/api/expenses?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      if (data.success) {
        setState({
          expenses: data.expenses,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch expenses');
      }
    } catch (error) {
      setState({
        expenses: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [category, month]);

  const addExpense = useCallback(async (expenseData: {
    amount: number;
    category: string;
    date: string;
    description?: string;
  }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add expense');
      }

      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          expenses: [data.expense, ...prev.expenses],
        }));
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to add expense');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update expense');
      }

      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.map(expense =>
            expense._id === id ? data.expense : expense
          ),
        }));
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to update expense');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete expense');
      }

      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.filter(expense => expense._id !== id),
        }));
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to delete expense');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  // Fetch expenses when component mounts or filters change
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    ...state,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}