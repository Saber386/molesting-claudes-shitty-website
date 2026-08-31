const db = require('../db');

// Create new post
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, visibility } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const result = await db.query(
      'INSERT INTO posts (user_id, title, content, visibility) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, content, visibility || 'public']
    );

    res.status(201).json({
      message: 'Post created successfully',
      post: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// Get all public posts with pagination
const getPublicPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.id, p.user_id, p.title, p.content, p.visibility, p.created_at, p.updated_at, 
              u.username,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.visibility = 'public'
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      posts: result.rows,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await db.query(
      `SELECT p.id, p.user_id, p.title, p.content, p.visibility, p.created_at, p.updated_at,
              u.username,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

// Update post - VULNERABLE to IDOR
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    // VULNERABILITY: IDOR - No authorization check
    const result = await db.query(
      'UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      message: 'Post updated successfully',
      post: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Delete post - VULNERABLE to IDOR
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    // VULNERABILITY: IDOR - No authorization check
    const result = await db.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Add comment to post - VULNERABLE to XSS
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content required' });
    }

    // Check if post exists
    const postCheck = await db.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // VULNERABILITY: Stored XSS - Content not sanitized
    const result = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, content]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Get comments for post - VULNERABLE to XSS on display
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await db.query(
      `SELECT c.id, c.content, c.created_at, u.id as user_id, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );

    // VULNERABILITY: XSS - Content not escaped in response
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const existing = await db.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Already liked' });
    }

    await db.query(
      'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
      [postId, userId]
    );

    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await db.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    res.json({ message: 'Post unliked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};

module.exports = {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getComments,
  likePost,
  unlikePost,
};
