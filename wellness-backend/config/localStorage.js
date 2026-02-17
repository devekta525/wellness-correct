import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Multer upload instance for local storage
const uploadLocal = multer({
    storage: diskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Function to get file URL for local storage
const getLocalFileUrl = (filename) => {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${filename}`;
};

// Function to save file locally
const saveFileLocally = async (file) => {
    // File is already saved by multer diskStorage
    // Just return the URL
    return getLocalFileUrl(file.filename);
};

// Function to delete local file
const deleteLocalFile = (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Extract filename from URL
        const filename = fileUrl.split('/uploads/').pop();
        if (!filename) return;

        const filePath = path.join(uploadsDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted local file: ${filename}`);
        }
    } catch (error) {
        console.error('Error deleting local file:', error.message);
    }
};

export {
    uploadLocal,
    saveFileLocally,
    deleteLocalFile,
    getLocalFileUrl,
};
