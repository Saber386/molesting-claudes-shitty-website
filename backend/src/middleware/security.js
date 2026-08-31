const cors = require('cors');
const express = require('express');

// VULNERABILITY: Missing important security headers
const securityHeaders = (req, res, next) => {
  // VULNERABILITY: No CSP header
  // VULNERABILITY: No X-Frame-Options
  // VULNERABILITY: No X-Content-Type-Options
  
  res.setHeader('X-UA-Compatible', 'IE=edge');
  res.setHeader('X-XSS-Protection', '0'); // Disabled - VULNERABILITY
  
  next();
};

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

const jsonParser = express.json({ limit: '10mb' });
const urlEncodedParser = express.urlencoded({ limit: '10mb', extended: true });

module.exports = {
  securityHeaders,
  corsMiddleware,
  jsonParser,
  urlEncodedParser,
};
