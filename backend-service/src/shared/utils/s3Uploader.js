const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

// Initialize S3 Client (compatible with Cloudflare R2)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (req, file, cb) => {
  const uniqueSuffix = crypto.randomBytes(8).toString('hex') + '-' + Date.now();
  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  // Create folders based on module/route if available, else 'misc'
  const folder = req.uploadFolder || 'misc';
  cb(null, `${folder}/${baseName}-${uniqueSuffix}${ext}`);
};

// Multer S3 Storage Configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.R2_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: generateFileName,
});

// File filter (restrict to images and pdfs)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Helper to get public URL if using a custom domain or R2.dev URL
const getPublicUrl = (key) => {
  if (!key) return null;
  const baseUrl = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
  return `${baseUrl}/${key}`;
};

module.exports = {
  s3Client,
  upload,
  getPublicUrl
};
