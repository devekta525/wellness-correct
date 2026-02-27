/**
 * S3 Configuration and Upload Service
 *
 * This file now acts as a compatibility layer and re-exports the unified upload service.
 * For a cleaner implementation, use uploadService.js directly from utils folder.
 *
 * DEPRECATED: Consider importing from utils/uploadService.js instead
 *
 * Example:
 *   import { upload, uploadFile, deleteFile } from '../utils/uploadService.js';
 */

import {
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
  getIsS3Configured,
  uploadToS3,
} from '../utils/uploadService.js';

// Re-export all functions for backward compatibility
export {
  upload,
  uploadFile,
  uploadToS3,
  uploadFiles,
  deleteFile,
  deleteFiles,
  replaceFile,
  getStorageInfo,
  validateFile,
  isValidFileSize,
  isValidFileType,
};

// Aliases for legacy code
export const deleteOldImage = deleteFile;
export const isS3Configured = getIsS3Configured;

export default {
  upload,
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  replaceFile,
  getStorageInfo,
  validateFile,
};