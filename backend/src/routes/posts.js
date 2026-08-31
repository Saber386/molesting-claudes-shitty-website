const express = require('express');
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get public posts
router.get('/', postController.getPublicPosts);

// Create post
router.post('/', verifyToken, postController.createPost);

// Get post by ID
router.get('/:postId', postController.getPostById);

// Update post - VULNERABLE to IDOR
router.put('/:postId', verifyToken, postController.updatePost);

// Delete post - VULNERABLE to IDOR
router.delete('/:postId', verifyToken, postController.deletePost);

// Add comment - VULNERABLE to XSS
router.post('/:postId/comments', verifyToken, postController.addComment);

// Get comments - VULNERABLE to XSS on display
router.get('/:postId/comments', postController.getComments);

// Like post
router.post('/:postId/like', verifyToken, postController.likePost);

// Unlike post
router.delete('/:postId/like', verifyToken, postController.unlikePost);

module.exports = router;
