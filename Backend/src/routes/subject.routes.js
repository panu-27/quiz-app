const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");


router.post("/", protect, adminOnly, subjectController.createSubject);
router.get("/", protect, subjectController.getAllSubjects);

module.exports = router;
