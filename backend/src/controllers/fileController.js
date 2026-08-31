const db = require('../db');
const path = require('path');
const fs = require('fs');

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const filename = req.file.filename;
    const filepath = `/uploads/${filename}`;
    const mimeType = req.file.mimetype;

    // VULNERABILITY: Insecure file upload - only checks extension, not actual content
    // Could be bypassed by renaming malicious files
    
    const result = await db.query(
      'UPDATE profiles SET profile_picture_url = $1 WHERE user_id = $2 RETURNING *',
      [filepath, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      message: 'Profile picture uploaded successfully',
      filename,
      filepath,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File upload failed' });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { isPublic } = req.body;
    const filename = req.file.filename;
    const filepath = `/uploads/${filename}`;
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;

    // VULNERABILITY: File type validation via extension only
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    
    // This check is bypassable (only checks mime type from client)
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const result = await db.query(
      'INSERT INTO documents (user_id, filename, file_path, mime_type, file_size, is_public) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, filename, filepath, mimeType, fileSize, isPublic || false]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Document upload failed' });
  }
};

// Get user documents
const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, filename, file_path, mime_type, file_size, is_public, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// Download document
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = result.rows[0];

    // Check access - VULNERABILITY: Can only access own documents, but no enforcement on file access
    if (document.user_id !== userId && !document.is_public) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filepath = path.join(__dirname, '../../uploads', path.basename(document.file_path));

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filepath, document.filename);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Download failed' });
  }
};

// Delete document - VULNERABLE to IDOR
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // VULNERABILITY: IDOR - No check if user owns document
    const result = await db.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = {
  uploadProfilePicture,
  uploadDocument,
  getUserDocuments,
  downloadDocument,
  deleteDocument,
};
