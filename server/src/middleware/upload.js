const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage so files are available as buffers for cloudinary upload
const storage = multer.memoryStorage();

// Image file filter
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed.'), false);
  }
};

// Video file filter
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only video files are allowed.'), false);
  }
};

// Upload image: single file, max 5MB
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('image');

// Upload video: single file, max 100MB
const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
}).single('video');

module.exports = { uploadImage, uploadVideo };
