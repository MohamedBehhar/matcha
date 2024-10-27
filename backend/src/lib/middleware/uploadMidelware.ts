import multer from "multer";
import path from "path";
import fs from "fs";


const uploadDir = path.join(__dirname, '../../../public');
// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

// Initialize upload middleware
const upload = multer({ storage });

export default upload;
