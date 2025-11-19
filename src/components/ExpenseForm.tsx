'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import {
  Close,
  AttachMoney,
  Category,
  CalendarToday,
  Description,
  Restaurant,
  Flight,
  Receipt,
  ShoppingBag,
  MoreHoriz,
} from '@mui/icons-material';

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

const categories = [
  { value: 'Food', label: 'Food', icon: <Restaurant /> },
  { value: 'Travel', label: 'Travel', icon: <Flight /> },
  { value: 'Bills', label: 'Bills', icon: <Receipt /> },
  { value: 'Shopping', label: 'Shopping', icon: <ShoppingBag /> },
  { value: 'Other', label: 'Other', icon: <MoreHoriz /> },
] as const;

export default function ExpenseForm({ isOpen, onClose, onSubmit, editingExpense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Other' as 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700}>
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            aria-label="Close dialog"
          >
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {editingExpense ? 'Update your expense details' : 'Track a new expense'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              inputProps={{
                step: '0.01',
                min: '0.01',
              }}
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
              helperText="Enter the expense amount"
            />

            <TextField
              fullWidth
              select
              label="Category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other',
                })
              }
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category />
                  </InputAdornment>
                ),
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {category.icon}
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: format(new Date(), 'yyyy-MM-dd'),
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              placeholder="Optional: Add notes about this expense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <Description />
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            size="large"
            sx={{
              minWidth: 120,
              background: editingExpense
                ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              '&:hover': {
                background: editingExpense
                  ? 'linear-gradient(135deg, #0284c7 0%, #075985 100%)'
                  : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              },
            }}
          >
            {loading ? 'Saving...' : editingExpense ? 'Update' : 'Add Expense'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}