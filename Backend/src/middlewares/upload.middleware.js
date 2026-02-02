import multer from "multer";

const storage = multer.memoryStorage();

export const uploadPDF = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});
