'use client';

import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const categoryColors = {
    Food: 'bg-orange-100 text-orange-800',
    Travel: 'bg-blue-100 text-blue-800',
    Bills: 'bg-red-100 text-red-800',
    Shopping: 'bg-purple-100 text-purple-800',
    Other: 'bg-gray-100 text-gray-800',
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="text-gray-400 text-lg">No expenses found</div>
          <p className="text-gray-500 mt-2">
            Start by adding your first expense to track your spending.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <li key={expense._id}>
            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${categoryColors[expense.category]}`}
                    >
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {expense.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(expense)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this expense?')) {
                      onDelete(expense._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}