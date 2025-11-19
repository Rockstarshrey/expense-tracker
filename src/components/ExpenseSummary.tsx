'use client';

import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';

interface ExpenseSummaryProps {
  expenses: Expense[];
  selectedMonth: string;
}

export default function ExpenseSummary({ expenses, selectedMonth }: ExpenseSummaryProps) {
  // Calculate total for selected month
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors = {
    Food: 'bg-orange-100 text-orange-800',
    Travel: 'bg-blue-100 text-blue-800',
    Bills: 'bg-red-100 text-red-800',
    Shopping: 'bg-purple-100 text-purple-800',
    Other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Monthly Summary
            </h3>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-center">
            <dt className="text-2xl font-bold text-gray-900">
              ${totalExpenses.toFixed(2)}
            </dt>
            <dd className="mt-1 text-sm text-gray-500">
              Total for {selectedMonth ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy') : 'all time'}
            </dd>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900">Categories</div>
          <div className="mt-2 space-y-1">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${categoryColors[category as keyof typeof categoryColors]}`}>
                    {category}
                  </span>
                </div>
                <div className="text-gray-900 font-medium">
                  ${amount.toFixed(2)}
                </div>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <div className="text-gray-500 text-center py-2">
                No expenses for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}