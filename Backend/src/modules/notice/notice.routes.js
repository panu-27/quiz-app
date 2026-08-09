import express from "express";
import { createNotice, getNotices, deleteNotice } from "./notice.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import multer from "multer";
import { attachmentStorage } from "../../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: attachmentStorage });

router.route("/")
  .post(auth, upload.fields([{ name: "attachment", maxCount: 1 }, { name: "image", maxCount: 1 }]), createNotice)
  .get(auth, getNotices);

router.route("/:id")
  .delete(auth, deleteNotice);

export default router;
