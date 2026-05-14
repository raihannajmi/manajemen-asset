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

// TODO: Add Modular Routes here

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
