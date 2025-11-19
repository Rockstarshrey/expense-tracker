import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch user's expenses with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Connect to database
    await clientPromise;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const month = searchParams.get('month'); // Format: YYYY-MM

    // Build query
    const query: any = { userId: tokenPayload.userId };

    // Add category filter if specified
    if (category && category !== 'All') {
      query.category = category;
    }

    // Add month filter if specified
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('Fetch expenses error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new expense
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get expense data
    const { amount, category, date, description } = await request.json();

    // Validate input
    if (!amount || !category || !date) {
      return NextResponse.json(
        { success: false, error: 'Amount, category, and date are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate date
    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Don't allow future dates
    if (expenseDate > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Date cannot be in the future' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description && description.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Description cannot be more than 255 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await clientPromise;

    // Create new expense
    const expense = new Expense({
      userId: tokenPayload.userId,
      amount: parseFloat(amount.toFixed(2)), // Round to 2 decimal places
      category,
      date: expenseDate,
      description: description ? description.trim() : ''
    });

    await expense.save();

    return NextResponse.json(
      {
        success: true,
        expense
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}