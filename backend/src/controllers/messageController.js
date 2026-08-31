const db = require('../db');

// Send message to another user
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content required' });
    }

    // Check if recipient exists
    const recipientCheck = await db.query('SELECT id FROM users WHERE id = $1', [recipientId]);
    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const result = await db.query(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3) RETURNING *',
      [senderId, recipientId, content]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get message by ID - VULNERABLE to IDOR
const getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;

    // VULNERABILITY: IDOR - No check if user is sender or recipient
    const result = await db.query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
              sender.username as sender_username, recipient.username as recipient_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE m.id = $1`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

// Get conversation with another user
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const result = await db.query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
              sender.username as sender_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 50`,
      [userId, otherUserId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
};

// Get inbox (all conversations)
const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // VULNERABILITY: IDOR - No authorization check, but endpoint accessible to authenticated users
    const result = await db.query(
      `SELECT DISTINCT ON (GREATEST(sender_id, recipient_id), LEAST(sender_id, recipient_id))
              m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
              CASE WHEN sender_id = $1 THEN recipient.username ELSE sender.username END as other_user_username,
              CASE WHEN sender_id = $1 THEN m.recipient_id ELSE m.sender_id END as other_user_id
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY GREATEST(sender_id, recipient_id), LEAST(sender_id, recipient_id), m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch inbox' });
  }
};

// Delete message - VULNERABLE to IDOR
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // VULNERABILITY: IDOR - No check if user is sender or recipient
    const result = await db.query(
      'DELETE FROM messages WHERE id = $1 RETURNING id',
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    // VULNERABILITY: IDOR - No authorization check
    const result = await db.query(
      'UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING *',
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

module.exports = {
  sendMessage,
  getMessageById,
  getConversation,
  getInbox,
  deleteMessage,
  markAsRead,
};
