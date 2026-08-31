const express = require('express');
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All message routes require authentication
router.use(verifyToken);

// Send message
router.post('/', messageController.sendMessage);

// Get message by ID - VULNERABLE to IDOR
router.get('/:messageId', messageController.getMessageById);

// Get conversation with another user
router.get('/conversation/:otherUserId', messageController.getConversation);

// Get inbox
router.get('/', messageController.getInbox);

// Delete message - VULNERABLE to IDOR
router.delete('/:messageId', messageController.deleteMessage);

// Mark as read - VULNERABLE to IDOR
router.put('/:messageId/read', messageController.markAsRead);

module.exports = router;
