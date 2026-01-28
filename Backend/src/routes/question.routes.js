const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question.controller");

router.post("/", questionController.createQuestion);
router.post("/bulk", questionController.createQuestionsBulk);
router.get("/topic/:topicId", questionController.getQuestionsByTopic);

module.exports = router;
