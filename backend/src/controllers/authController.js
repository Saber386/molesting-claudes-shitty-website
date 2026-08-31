const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    // VULNERABILITY: User enumeration - can determine if email/username exists
    const existing = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, passwordHash, 'student']
    );

    const userId = result.rows[0].id;

    // Create profile
    await db.query(
      'INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)',
      [userId, fullName || username]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    // VULNERABILITY: Stack trace exposure
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // VULNERABILITY: Information disclosure - different error messages for invalid username vs password
    const result = await db.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // VULNERABILITY: JWT contains modifiable claims without server-side validation
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    // VULNERABILITY: Stack trace exposure
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const result = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // VULNERABILITY: User enumeration - different response for valid/invalid email
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = result.rows[0].id;
    // VULNERABILITY: Predictable reset token
    const resetToken = `reset_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, resetToken, expiresAt]
    );

    // In a real app, this would be sent via email
    res.json({
      message: 'Password reset token generated',
      // VULNERABILITY: Token exposed in response (for testing purposes)
      token: resetToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and password required' });
    }

    // VULNERABILITY: Token validation is weak - doesn't check expiration
    const result = await db.query(
      'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND used = FALSE',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const userId = result.rows[0].user_id;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password and mark token as used
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
