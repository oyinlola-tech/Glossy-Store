const multer = require('multer');
const path = require('path');
const fs = require('fs');

const supportUploadDir = path.resolve(__dirname, '..', '..', 'private_uploads', 'support');
if (!fs.existsSync(supportUploadDir)) {
  fs.mkdirSync(supportUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, supportUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `support-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Unsupported attachment type'));
  }
  return cb(null, true);
};

const supportUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

module.exports = { supportUpload, supportUploadDir };
