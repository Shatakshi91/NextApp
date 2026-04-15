const cloudinary          = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer              = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for chat images
const messageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nexchat/messages',
    allowed_formats: ['jpg','jpeg','png','gif','webp'],
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  },
});

// Storage for profile pics
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nexchat/profiles',
    allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const uploadMessage = multer({
  storage: messageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
});

module.exports = { cloudinary, uploadMessage, uploadProfile };
