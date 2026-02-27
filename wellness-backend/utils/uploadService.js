import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const uploadsDir = path.join(__dirname, '../uploads');

// Check if AWS S3 is properly configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  );
};

// Determine which storage backend to use
const useS3 = isS3Configured() && process.env.STORAGE_TYPE !== 'local';

// Log current storage configuration
console.log(`📦 Upload Service Initialized - Storage: ${useS3 ? 'AWS S3' : 'Local Filesystem'}`);

// Create uploads directory if using local storage
if (!useS3 && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadsDir}`);
}

// Initialize S3 client only if configured
let s3Client = null;
if (useS3) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

// Local storage configuration
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// Common file filter
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Only image files are allowed. Received: ${file.mimetype}`),
      false
    );
  }
};

// Common file size limit
const fileSizeLimit = 5 * 1024 * 1024; // 5MB

// Create multer instance based on storage type
export const upload = multer({
  storage: useS3 ? memoryStorage : localDiskStorage,
  limits: {
    fileSize: fileSizeLimit,
  },
  fileFilter,
});

// ============================================================================
// LOCAL FILE FUNCTIONS
// ============================================================================

/**
 * Get the full URL for a local file
 * @param {string} filename - The filename
 * @returns {string} - The full URL
 */
const getLocalFileUrl = (filename) => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Delete a file from local storage
 * @param {string} fileUrl - The file URL
 */
const deleteLocalFile = (fileUrl) => {
  try {
    if (!fileUrl) return;

    // Extract filename from URL (handle both cases: full URL and just filename)
    const filename = fileUrl.includes('/uploads/')
      ? fileUrl.split('/uploads/').pop()
      : fileUrl;

    if (!filename) return;

    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted local file: ${filename}`);
    }
  } catch (error) {
    console.error('❌ Error deleting local file:', error.message);
  }
};

// ============================================================================
// S3 FILE FUNCTIONS
// ============================================================================

/**
 * Upload a file to AWS S3
 * @param {Object} file - The file object from multer
 * @param {string} folder - Optional folder name in S3
 * @returns {Promise<string>} - The S3 URL
 */
const uploadToS3 = async (file, folder = 'uploads') => {
  if (!useS3 || !isS3Configured()) {
    throw new Error(
      'S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME.'
    );
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext);
  const s3Key = `${folder}/${name}-${uniqueSuffix}${ext}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log(`✅ File uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error('❌ Error uploading file to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Delete a file from AWS S3
 * @param {string} fileUrl - The S3 URL
 * @param {string} folder - Optional folder name in S3
 */
const deleteFromS3 = async (fileUrl, folder = 'uploads') => {
  if (!useS3 || !isS3Configured()) {
    console.warn('⚠️  S3 is not configured. Skipping S3 deletion.');
    return;
  }

  try {
    // Extract S3 key from URL
    const urlParts = fileUrl.split(`${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`);
    const s3Key = urlParts[1] || fileUrl;

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`🗑️  Deleted S3 file: ${s3Key}`);
  } catch (error) {
    console.error('❌ Error deleting S3 file:', error.message);
    throw new Error(`Failed to delete S3 file: ${error.message}`);
  }
};

// ============================================================================
// UNIFIED UPLOAD SERVICE
// ============================================================================

/**
 * Upload a file (automatically uses S3 or local storage)
 * @param {Object} file - The file object from multer
 * @param {string} folder - Optional folder name (for organization)
 * @returns {Promise<string>} - The file URL (local path or S3 URL)
 */
export const uploadFile = async (file, folder = 'uploads') => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (useS3) {
    return await uploadToS3(file, folder);
  } else {
    // File is already saved by multer, just return the URL
    return getLocalFileUrl(file.filename);
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - Optional folder name
 * @returns {Promise<Array>} - Array of file URLs
 */
export const uploadFiles = async (files, folder = 'uploads') => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const uploadPromises = files.map(file => uploadFile(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file (automatically uses S3 or local storage)
 * @param {string} fileUrl - The file URL
 * @param {string} folder - Optional folder name (for S3)
 */
export const deleteFile = async (fileUrl, folder = 'uploads') => {
  if (!fileUrl) return;

  if (useS3) {
    await deleteFromS3(fileUrl, folder);
  } else {
    deleteLocalFile(fileUrl);
  }
};

/**
 * Delete multiple files
 * @param {Array} fileUrls - Array of file URLs
 * @param {string} folder - Optional folder name (for S3)
 */
export const deleteFiles = async (fileUrls, folder = 'uploads') => {
  if (!fileUrls || fileUrls.length === 0) return;

  const deletePromises = fileUrls.map(url => deleteFile(url, folder));
  await Promise.all(deletePromises);
};

/**
 * Replace a file (delete old, upload new)
 * @param {Object} newFile - The new file object from multer
 * @param {string} oldFileUrl - The old file URL to delete
 * @param {string} folder - Optional folder name
 * @returns {Promise<string>} - The new file URL
 */
export const replaceFile = async (newFile, oldFileUrl, folder = 'uploads') => {
  if (!newFile) {
    throw new Error('No file provided');
  }

  // Delete old file first
  if (oldFileUrl) {
    await deleteFile(oldFileUrl, folder);
  }

  // Upload new file
  return await uploadFile(newFile, folder);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get storage information
 * @returns {Object} - Storage info
 */
export const getStorageInfo = () => {
  return {
    type: useS3 ? 's3' : 'local',
    s3Configured: isS3Configured(),
    bucket: process.env.AWS_BUCKET_NAME || null,
    region: process.env.AWS_REGION || null,
    uploadsDir: useS3 ? null : uploadsDir,
    maxFileSize: `${fileSizeLimit / (1024 * 1024)}MB`,
  };
};

/**
 * Check if S3 is configured
 * @returns {boolean} - True if S3 is properly configured
 */
export const getIsS3Configured = () => isS3Configured();

/**
 * Validate file size
 * @param {Object} file - File object
 * @returns {boolean} - True if valid
 */
export const isValidFileSize = (file) => {
  return file && file.size <= fileSizeLimit;
};

/**
 * Validate file type
 * @param {Object} file - File object
 * @returns {boolean} - True if valid
 */
export const isValidFileType = (file) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];
  return file && allowedMimes.includes(file.mimetype);
};

/**
 * Validate a file (size and type)
 * @param {Object} file - File object
 * @returns {Object} - { valid: boolean, error: string | null }
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!isValidFileSize(file)) {
    return { valid: false, error: `File size exceeds ${fileSizeLimit / (1024 * 1024)}MB limit` };
  }

  if (!isValidFileType(file)) {
    return { valid: false, error: 'Invalid file type. Only images are allowed' };
  }

  return { valid: true, error: null };
};

export default {
  upload,
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  replaceFile,
  getStorageInfo,
  validateFile,
  isValidFileSize,
  isValidFileType,
};
export { uploadToS3 };
