const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(verifyToken);

// VULNERABILITY: Admin role check is weak - only checks JWT claim
// A student can potentially escalate if they modify JWT or find privilege escalation
// router.use(requireRole('admin')); // This should be here but we've left it out for vulnerability

// Get all users
router.get('/users', requireRole('admin'), adminController.getAllUsers);

// Update user role - VULNERABLE to privilege escalation
router.put('/users/:userId/role', requireRole('admin'), adminController.updateUserRole);

// Deactivate user
router.put('/users/:userId/deactivate', requireRole('admin'), adminController.deactivateUser);

// Get dashboard statistics
router.get('/stats', requireRole('admin'), adminController.getDashboardStats);

// Search users
router.get('/users/search', requireRole('admin'), adminController.searchUsersAdmin);

// Get all documents
router.get('/documents', requireRole('admin'), adminController.getAllDocuments);

// Delete user
router.delete('/users/:userId', requireRole('admin'), adminController.deleteUserAdmin);

// VULNERABILITY: This endpoint doesn't exist but shows a privilege escalation vector
// A student could potentially access admin endpoints if they can modify their JWT role
router.put('/users/:userId/role-direct', adminController.updateUserRole);

module.exports = router;
