'use client';

import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  Flight,
  Receipt,
  ShoppingBag,
  MoreHoriz,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseSummaryProps {
  expenses: Expense[];
  selectedMonth: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Food: <Restaurant />,
  Travel: <Flight />,
  Bills: <Receipt />,
  Shopping: <ShoppingBag />,
  Other: <MoreHoriz />,
};

const categoryColors: Record<string, string> = {
  Food: '#f97316',
  Travel: '#3b82f6',
  Bills: '#ef4444',
  Shopping: '#a855f7',
  Other: '#6b7280',
};

export default function ExpenseSummary({ expenses, selectedMonth }: ExpenseSummaryProps) {
  const theme = useTheme();
  
  // Calculate total for selected month
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for pie chart
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: categoryColors[category],
  }));

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
          : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        color: 'white',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
            }}
          >
            <TrendingUp sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Monthly Summary
          </Typography>
        </Box>

        {/* Total Amount */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            Total Expenses
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            ${totalExpenses.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {selectedMonth ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy') : 'All time'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }} />

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <Box sx={{ mb: 3, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Category Breakdown */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Object.entries(categoryTotals).map(([category, amount]) => {
              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
              return (
                <Box key={category}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          color: categoryColors[category],
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                          p: 0.5,
                          display: 'flex',
                          fontSize: 20,
                        }}
                      >
                        {categoryIcons[category]}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {category}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        ${amount.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: 'white',
                        borderRadius: 2,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
            {Object.keys(categoryTotals).length === 0 && (
              <Typography variant="body2" sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
                No expenses for this period
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}