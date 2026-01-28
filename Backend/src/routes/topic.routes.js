const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topic.controller");

router.post("/", topicController.createTopic);
router.post("/bulk", topicController.createTopicsBulk);
router.get("/chapter/:chapterId", topicController.getTopicsByChapter);


module.exports = router;
