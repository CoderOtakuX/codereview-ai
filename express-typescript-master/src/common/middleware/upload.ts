import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const allowedExtensions = [".js", ".ts", ".py", ".go", ".java", ".cpp"];

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024, // 50 kb
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file extension. Allowed extensions are: .js, .ts, .py, .go, .java, .cpp"));
        }
    }
});
