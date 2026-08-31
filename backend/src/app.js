require('dotenv').config();

const express = require('express');
const path = require('path');
const { securityHeaders, corsMiddleware, jsonParser, urlEncodedParser } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(jsonParser);
app.use(urlEncodedParser);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusHub API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

// VULNERABILITY: Unhandled error middleware exposes stack traces
app.use((err, req, res, next) => {
  console.error(err);
  
  // VULNERABILITY: Stack trace exposed in error response
  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`CampusHub API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
