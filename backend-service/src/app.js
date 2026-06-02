const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/auth.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Manajemen Asset API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Manajemen Asset API is running' });
});

app.use('/api/v1/auth', authRoutes);

const assetRoutes = require('./modules/assets/asset.routes');
app.use('/api/v1/assets', assetRoutes);

const rentalRoutes = require('./modules/rentals/rental.routes');
app.use('/api/v1/rentals', rentalRoutes);

const billingRoutes = require('./modules/billing/billing.routes');
app.use('/api/v1', billingRoutes);

const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
app.use('/api/v1/dashboard', dashboardRoutes);

const auditRoutes = require('./modules/audit/audit.routes');
app.use('/api/v1/audit-logs', auditRoutes);

const orderRoutes = require('./modules/orders/order.routes');
app.use('/api/v1/orders', orderRoutes);

const expenseRoutes = require('./modules/expenses/expense.routes');
app.use('/api/v1/expenses', expenseRoutes);

const budgetRoutes = require('./modules/budgets/budget.routes');
app.use('/api/v1/budgets', budgetRoutes);

const revenueRoutes = require('./modules/revenue/revenue.routes');
app.use('/api/v1/revenue', revenueRoutes);

const reportRoutes = require('./modules/reports/report.routes');
app.use('/api/v1/reports', reportRoutes);

const userRoutes = require('./modules/users/user.routes');
app.use('/api/v1/users', userRoutes);





// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      error: 'Conflict',
      message: `Data dengan nilai unik pada ${field} sudah ada.`,
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Data yang dimaksud tidak ditemukan.',
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.details.map(d => d.message).join(', '),
    });
  }

  res.status(err.statusCode || 500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

module.exports = app;
