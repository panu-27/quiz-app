const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const testController = require("../controllers/test.controller");

router.post("/", protect, adminOnly, testController.createTest);
router.get("/", protect, testController.getAllTests);

module.exports = router;
