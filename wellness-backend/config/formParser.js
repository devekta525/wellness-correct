import multer from "multer";

const storage = multer.memoryStorage();
const formParser = multer({
    storage,
    limits: { fieldSize: 25 * 1024 * 1024 } // 25MB per field, adjust as needed
});

export default formParser;