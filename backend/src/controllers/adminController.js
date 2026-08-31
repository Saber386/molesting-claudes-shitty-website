const db = require('../db');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
              p.full_name, p.bio, p.major
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) as total FROM users');
    const total = countResult.rows[0].total;

    res.json({
      users: result.rows,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Update user role - VULNERABLE to privilege escalation
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // VULNERABILITY: No server-side role validation beyond basic check
    // A student can call this endpoint if they forge a request with admin role in JWT
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated',
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deactivated',
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Total posts
    const postsCount = await db.query('SELECT COUNT(*) as count FROM posts');
    
    // Total documents
    const docsCount = await db.query('SELECT COUNT(*) as count FROM documents');
    
    // Total messages
    const messagesCount = await db.query('SELECT COUNT(*) as count FROM messages');
    
    // Users by role
    const usersByRole = await db.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    res.json({
      totalUsers: usersCount.rows[0].count,
      totalPosts: postsCount.rows[0].count,
      totalDocuments: docsCount.rows[0].count,
      totalMessages: messagesCount.rows[0].count,
      usersByRole: usersByRole.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Search users (admin only)
const searchUsersAdmin = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query too short' });
    }

    // VULNERABILITY: SQL Injection in admin search
    const sqlQuery = `SELECT u.id, u.username, u.email, u.role, u.is_active, p.full_name 
                      FROM users u 
                      LEFT JOIN profiles p ON u.id = p.user_id 
                      WHERE username ILIKE '%${query}%' OR email ILIKE '%${query}%' 
                      LIMIT 50`;
    
    const result = await db.query(sqlQuery);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// Get all uploaded documents (admin)
const getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT d.id, d.user_id, d.filename, d.file_path, d.mime_type, d.file_size, d.is_public, d.created_at,
              u.username
       FROM documents d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      documents: result.rows,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// Delete any user (admin only)
const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting self
    if (userId == req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getDashboardStats,
  searchUsersAdmin,
  getAllDocuments,
  deleteUserAdmin,
};
