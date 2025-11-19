import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

// GET: Fetch single expense by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from JWT token
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Await params to get the ID
    const { id } = await params;

    // Validate expense ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await clientPromise();

    // Find expense and verify ownership
    const expense = await Expense.findOne({
      _id: id,
      userId: tokenPayload.userId
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('Fetch expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from JWT token
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Await params to get the ID
    const { id } = await params;

    // Validate expense ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Get update data
    const { amount, category, date, description } = await request.json();

    // Connect to database
    await clientPromise();

    // Find expense and verify ownership
    const expense = await Expense.findOne({
      _id: id,
      userId: tokenPayload.userId
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Validate and update fields if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }
      expense.amount = parseFloat(amount.toFixed(2));
    }

    if (category !== undefined) {
      const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        );
      }
      expense.category = category;
    }

    if (date !== undefined) {
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

      expense.date = expenseDate;
    }

    if (description !== undefined) {
      if (description && description.length > 255) {
        return NextResponse.json(
          { success: false, error: 'Description cannot be more than 255 characters' },
          { status: 400 }
        );
      }
      expense.description = description ? description.trim() : '';
    }

    await expense.save();

    return NextResponse.json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('Update expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from JWT token
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate expense ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await clientPromise();

    // Find and delete expense (verifying ownership)
    const result = await Expense.deleteOne({
      _id: params.id,
      userId: tokenPayload.userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}