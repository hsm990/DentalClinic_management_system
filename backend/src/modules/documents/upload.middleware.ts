import multer from "multer";
import { Request } from "express";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error("Unsupported file type. Allowed: JPEG, PNG, WEBP, PDF."),
    );
  }
  cb(null, true);
}

export const uploadDocument = multer({
  storage: multer.memoryStorage(), // buffer in memory, never written to local disk
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");
