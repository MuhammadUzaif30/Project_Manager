const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- TEST FIX: Dummy Socket.IO ---
// Prevents controllers from crashing during tests when they try to emit real-time events.
// When running the real server, server.js will overwrite this with the real Socket.IO instance.
app.set('io', {
  to: () => ({ emit: () => {} }),
  emit: () => {}
});
// ---------------------------------

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// SAFE SANITIZER: Only sanitizes body and params, skips the read-only query
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);

app.use(errorHandler);

module.exports = app;