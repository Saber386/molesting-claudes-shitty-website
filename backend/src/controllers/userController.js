const db = require('../db');

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT u.id, u.username, u.email, u.role, p.full_name, p.bio, p.profile_picture_url, p.major, p.location FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Get user by ID - VULNERABLE to IDOR
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // VULNERABILITY: IDOR - No check if requester can view this profile
    const result = await db.query(
      'SELECT u.id, u.username, u.email, u.role, p.full_name, p.bio, p.profile_picture_url, p.major, p.location FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Update user profile - VULNERABLE to IDOR
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, bio, major, location } = req.body;

    // VULNERABILITY: IDOR - No check if requester owns this profile
    const updateResult = await db.query(
      'UPDATE profiles SET full_name = $1, bio = $2, major = $3, location = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5 RETURNING *',
      [fullName, bio, major, location, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ message: 'Profile updated successfully', profile: updateResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Update current user profile (should be the secure version)
const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, major, location } = req.body;

    const updateResult = await db.query(
      'UPDATE profiles SET full_name = $1, bio = $2, major = $3, location = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5 RETURNING *',
      [fullName, bio, major, location, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ message: 'Profile updated successfully', profile: updateResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Search users - VULNERABLE to stored/reflected XSS and SQL injection
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    // VULNERABILITY: SQL Injection via string concatenation
    const sqlQuery = `SELECT id, username, u.email FROM users u WHERE username ILIKE '%${query}%' OR u.email ILIKE '%${query}%' LIMIT 20`;
    
    const result = await db.query(sqlQuery);

    // VULNERABILITY: Stored XSS - User data not sanitized in response
    res.json({
      results: result.rows.map(row => ({
        ...row,
        searchQuery: query,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// Get all users (directory) - VULNERABILITY: Excessive data exposure
const getUserDirectory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // VULNERABILITY: Returning sensitive data (email, role) in directory
    const result = await db.query(
      'SELECT u.id, u.username, u.email, u.role, p.full_name, p.bio, p.profile_picture_url, p.major FROM users u LEFT JOIN profiles p ON u.id = p.user_id ORDER BY u.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      users: result.rows,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user directory' });
  }
};

// Get user messages
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
              sender.username as sender_username, recipient.username as recipient_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE m.recipient_id = $1 OR m.sender_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

module.exports = {
  getCurrentUser,
  getUserById,
  updateProfile,
  updateCurrentUserProfile,
  searchUsers,
  getUserDirectory,
  getMessages,
};
