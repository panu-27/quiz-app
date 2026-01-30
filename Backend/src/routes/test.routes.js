const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const testController = require("../controllers/test.controller");
const { getMyTestHistory, getAttemptAnalytics } = require("../controllers/testController");
const { get } = require("mongoose");


router.get(
    "/analytics/:testId/attempt/:attemptNumber",
    protect,
    getAttemptAnalytics
);
router.post("/", protect, adminOnly, testController.createTest);
router.get("/", protect, testController.getAllTests);
router.get("/my-history", protect, getMyTestHistory);


module.exports = router;
