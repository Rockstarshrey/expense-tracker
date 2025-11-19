'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import Navbar from '@/components/Navbar';
import ExpenseSummary from '@/components/ExpenseSummary';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';

const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Other'];

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses(
    selectedCategory !== 'All' ? selectedCategory : undefined,
    selectedMonth
  );

  const handleAddExpense = async (expenseData: {
    amount: number;
    category: 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other';
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 70px)',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Loading expenses...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Error loading expenses
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Navbar />

      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4, md: 5 } }}>
        <Fade in timeout={300}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage your expenses efficiently
              </Typography>
            </Box>

            {/* Filters and Add Button */}
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'flex-end' },
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  flexGrow: 1,
                }}
              >
                <TextField
                  select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 } }}
                  InputProps={{
                    startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  type="month"
                  label="Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 } }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setIsFormOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  },
                }}
              >
                {isMobile ? 'Add' : 'Add Expense'}
              </Button>
            </Box>

            {/* Summary and Expenses Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '380px 1fr' },
                gap: 3,
              }}
            >
              {/* Summary Card */}
              <Box>
                <ExpenseSummary expenses={expenses} selectedMonth={selectedMonth} />
              </Box>

              {/* Expenses List */}
              <Box>
                <ExpenseList
                  expenses={expenses}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                />
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        editingExpense={editingExpense}
      />
    </Box>
  );
}