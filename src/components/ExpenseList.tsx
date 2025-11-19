'use client';

import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  List,
  ListItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restaurant,
  Flight,
  Receipt,
  ShoppingBag,
  MoreHoriz,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Food: <Restaurant />,
  Travel: <Flight />,
  Bills: <Receipt />,
  Shopping: <ShoppingBag />,
  Other: <MoreHoriz />,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Food: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
  Travel: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
  Bills: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  Shopping: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
  Other: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
};

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: (theme) => theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)'
                  : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No expenses found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first expense to track your spending
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} this period
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {expenses.map((expense, index) => (
            <Box key={expense._id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  px: 3,
                  py: 2.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  {/* Category Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: categoryColors[expense.category].bg,
                      color: categoryColors[expense.category].text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {categoryIcons[expense.category]}
                  </Box>

                  {/* Expense Details */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={expense.category}
                        size="small"
                        sx={{
                          background: categoryColors[expense.category].bg,
                          color: categoryColors[expense.category].text,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    {expense.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {expense.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Amount and Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      ${expense.amount.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit expense">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(expense)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.50',
                            },
                          }}
                          aria-label="Edit expense"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete expense">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this expense?')) {
                              onDelete(expense._id);
                            }
                          }}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.50',
                            },
                          }}
                          aria-label="Delete expense"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}