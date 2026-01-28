const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter.controller");

router.post("/", chapterController.createChapter);
router.get("/subject/:subjectId", chapterController.getChaptersBySubject);

module.exports = router;
