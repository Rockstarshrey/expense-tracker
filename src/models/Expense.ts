import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // Performance index for user queries
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food',
      'Travel',
      'Bills',
      'Shopping',
      'Other'
    ],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value: Date) {
        // Don't allow future dates
        return value <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },
  description: {
    type: String,
    required: false,
    maxlength: [255, 'Description cannot be more than 255 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for user + date queries (common for filtering)
ExpenseSchema.index({ userId: 1, date: -1 });

// Index for category filtering within user data
ExpenseSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);