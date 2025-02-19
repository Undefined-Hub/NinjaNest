const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectToMongo = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const mailRoutes = require("./src/routes/mailRoutes");
const propertyRoutes = require("./src/routes/propertyRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Welcome to the Ninja Nest App!');
  });

// Test route for error handling
app.get('/test-error', (req, res, next) => {
  const error = new Error('This is a test error!');
  error.status = 400; // Custom status code
  next(error);
});


// Routes
app.use("/api/auth",  authRoutes);
app.use("/api/user", userRoutes);

// Error handling middleware
const { errorHandler } = require('./src/middlewares/errorHandler');
app.use(errorHandler);

// Database connection
connectToMongo();

module.exports = app;
