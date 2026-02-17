import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import dotenv from 'dotenv';
import { uploadLocal, saveFileLocally, deleteLocalFile } from './localStorage.js';

dotenv.config();

// Check if AWS credentials are configured
const isS3Configured = () => {
  return !!(process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME);
};

// Determine storage type (s3 or local)
const useLocalStorage = process.env.STORAGE_TYPE === 'local' || !isS3Configured();

// Configure AWS SDK v3 S3 Client only if credentials are available
let s3 = null;
if (isS3Configured()) {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Set default folder name or use an environment variable to make it configurable
const folderName = process.env.AWS_FOLDER_NAME || "tax-consultancy";

// Choose appropriate upload middleware based on storage type
const upload = useLocalStorage ? uploadLocal : multer({ storage: multer.memoryStorage() });

// Unified upload function - uses S3 or local storage based on configuration
const uploadFile = async (file) => {
  if (useLocalStorage) {
    // Use local storage
    return await saveFileLocally(file);
  } else {
    // Use S3
    return await uploadToS3(file);
  }
};

// Function to upload file to S3
const uploadToS3 = async (file) => {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured. Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME in environment variables.');
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const filename = `${folderName}/${uniqueSuffix}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Function to delete old image (S3 or local)
const deleteOldImage = async (oldImageUrl) => {
  if (!oldImageUrl) return;

  if (useLocalStorage) {
    // Delete from local storage
    deleteLocalFile(oldImageUrl);
  } else {
    // Delete from S3
    if (!isS3Configured()) {
      console.warn('S3 is not configured. Skipping image deletion.');
      return;
    }

    const oldImageKey = oldImageUrl.split('/').pop();
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folderName}/${oldImageKey}`,
    };

    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      console.error(`Error deleting old image: ${error.message}`);
      throw error;
    }
  }
};

export {
  upload,
  uploadToS3,
  uploadFile,
  deleteOldImage,
  isS3Configured,
  useLocalStorage,
};