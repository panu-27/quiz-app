const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {startTest} = require("../controllers/testAttempt.controller");

router.post("/start/:testId", protect, startTest);

module.exports = router;
