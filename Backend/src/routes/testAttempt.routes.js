const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const attemptController = require("../controllers/testAttempt.controller");

router.post("/start/:testId", protect, attemptController.startTest);

module.exports = router;
