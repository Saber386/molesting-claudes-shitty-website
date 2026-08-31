const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // VULNERABILITY: Predictable file naming - uses user ID + timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '_' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  // VULNERABILITY: File size limit is high and extensions not properly validated
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // VULNERABILITY: Only checks extension, not actual file type
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];
    
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    
    cb(null, true);
  },
});

// All file routes require authentication
router.use(verifyToken);

// Upload profile picture
router.post('/profile-picture', upload.single('file'), fileController.uploadProfilePicture);

// Upload document
router.post('/document', upload.single('file'), fileController.uploadDocument);

// Get user documents
router.get('/documents', fileController.getUserDocuments);

// Download document
router.get('/download/:documentId', fileController.downloadDocument);

// Delete document - VULNERABLE to IDOR
router.delete('/document/:documentId', fileController.deleteDocument);

module.exports = router;
