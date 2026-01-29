const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const testController = require("../controllers/test.controller");
const { getMyTestHistory } = require("../controllers/testController");


router.post("/", protect, adminOnly, testController.createTest);
router.get("/", protect, testController.getAllTests);
router.get("/my-history", protect, getMyTestHistory);
module.exports = router;
