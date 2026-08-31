const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get current user
router.get('/me', verifyToken, userController.getCurrentUser);

// Update own profile
router.put('/profile', verifyToken, userController.updateCurrentUserProfile);

// Get user by ID (public)
router.get('/:userId', userController.getUserById);

// Update profile by ID - VULNERABLE to IDOR
router.put('/:userId/profile', verifyToken, userController.updateProfile);

// Search users
router.get('/search', userController.searchUsers);

// Get user directory
router.get('/', userController.getUserDirectory);

// Get user messages
router.get('/me/messages', verifyToken, userController.getMessages);

module.exports = router;
