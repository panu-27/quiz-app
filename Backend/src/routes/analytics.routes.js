const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const analyticsController = require("../controllers/analytics.controller");

router.get(
  "/student/:testId/:studentId",
  protect,
  adminOnly,
  analyticsController.studentTopicAnalysis
);
router.get(
  "/class/:testId",
  protect,
  adminOnly,
  analyticsController.classTopicAnalysis
);
router.get(
  "/rank/:testId",
  protect,
  adminOnly,
  analyticsController.testRanking
);

module.exports = router;
