import express from "express";
import { extractPDF , downloadPDF } from "./pdf.controller.js";
import { uploadPDF } from "../../middlewares/upload.middleware.js";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/extract",
  auth,
  role("TEACHER"),
  uploadPDF.single("file"),
  extractPDF
);

router.post(
  "/download",
  auth,
  role("TEACHER"),
  downloadPDF
);


export default router;
