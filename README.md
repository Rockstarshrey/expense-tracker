# Expense Tracker

A full-stack expense tracking web application built with Next.js 16, TypeScript, Tailwind CSS, Node.js, and MongoDB.

## Features

- **User Authentication**: Secure registration and login with JWT tokens stored in HTTP-only cookies
- **Expense Management**: Add, edit, delete, and view personal expenses
- **Categorization**: Organize expenses by categories (Food, Travel, Bills, Shopping, Other)
- **Monthly Filtering**: View expenses by specific months
- **Real-time Summary**: See total spending and category breakdowns
- **Responsive Design**: Works on desktop and mobile devices
- **Data Security**: Each user can only access their own expenses

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs for password hashing
- **Validation**: React Hook Form with Zod
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (for cloud database)
- Git

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd expense-tracker
npm install
```

### 2. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your actual values:

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user with strong password
4. Add your IP address to the network access list (use `0.0.0.0/0` for Vercel deployment)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and replace `<password>` with your database user password

#### Generate Secure Secrets:
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32
```

#### Final `.env.local`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
expense-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── expenses/      # Expense CRUD endpoints
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── login/            # Login page
│   │   ├── signup/           # Registration page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page (redirect)
│   │   └── globals.css       # Global styles
│   ├── components/            # React components
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── ExpenseForm.tsx   # Add/Edit expense modal
│   │   ├── ExpenseList.tsx   # Expense list display
│   │   └── ExpenseSummary.tsx # Monthly summary
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication state
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   └── useExpenses.ts    # Expense operations hook
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # JWT utilities
│   │   └── mongodb.ts       # MongoDB connection
│   └── models/               # Mongoose models
│       ├── User.ts          # User schema
│       └── Expense.ts       # Expense schema
├── public/                   # Static assets
├── .env.example             # Environment template
├── .env.local               # Local environment (don't commit)
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get user's expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get specific expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Complete expense tracker implementation"
git push origin main
```

2. **Connect to Vercel**:
- Go to [Vercel](https://vercel.com)
- Click "New Project" → Import your Git repository
- Vercel will auto-detect Next.js settings

3. **Set Environment Variables** in Vercel dashboard:
- `MONGODB_URI` (your MongoDB connection string)
- `JWT_SECRET` (your secure JWT secret)
- `NEXTAUTH_URL` (your Vercel domain)
- `NEXTAUTH_SECRET` (your secure NextAuth secret)

4. **Deploy**: Vercel will automatically deploy on push to main branch

### Manual Build

```bash
npm run build
npm start
```

## Security Features

- **Password Security**: Hashed with bcryptjs (12 salt rounds)
- **JWT Authentication**: HTTP-only cookies prevent XSS attacks
- **Input Validation**: Server-side validation for all user inputs
- **Data Isolation**: Users can only access their own expenses
- **SQL Injection Prevention**: Mongoose parameterized queries
- **XSS Prevention**: Input sanitization and content security policy

## Development Notes

- **Database Schema**: Users and Expenses are linked by `userId`
- **Error Handling**: Comprehensive error handling throughout the application
- **Type Safety**: Full TypeScript implementation with strict types
- **Performance**: Optimized queries with MongoDB indexes
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Verify your connection string is correct
   - Check that your database user has the right permissions
   - Ensure your IP is added to the MongoDB Atlas whitelist

2. **Build Fails**:
   - Ensure all environment variables are set
   - Run `npm install` to update dependencies
   - Check for TypeScript errors with `npm run build`

3. **Authentication Issues**:
   - Clear browser cookies to reset auth state
   - Verify JWT_SECRET is set and matches across environments
   - Check browser console for error messages

## Future Enhancements

- Monthly budget setting and tracking
- Expense analytics and charts
- Export to CSV/PDF functionality
- Expense receipt image uploads
- Recurring expenses setup
- Dark/light mode toggle
- Multi-currency support
- Advanced search and filtering
