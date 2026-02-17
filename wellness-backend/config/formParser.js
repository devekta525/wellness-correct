import multer from "multer";

// Use memory storage for parsing FormData (no file saving, just parsing fields)
const storage = multer.memoryStorage();
const formParser = multer({
    storage,
    limits: { fieldSize: 25 * 1024 * 1024 } // 25MB per field, adjust as needed
});

export default formParser;