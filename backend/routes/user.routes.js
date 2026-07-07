const express = require('express');
const multer = require('multer');
const protect = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getProfile, updateName, updateEmail, updateAvatar } = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

// Run multer, converting upload errors (size/type) into clean 400 responses.
const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 2MB or smaller'
          : err.message || 'Failed to upload image';
      return res.status(400).json({ message });
    }
    next();
  });
};

router.get('/profile', getProfile);
router.patch('/profile/name', updateName);
router.patch('/profile/email', updateEmail);
router.patch('/profile/avatar', uploadAvatar, updateAvatar);

module.exports = router;
