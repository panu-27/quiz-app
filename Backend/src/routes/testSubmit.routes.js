const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const submitController = require("../controllers/testSubmit.controller");

router.post("/:testId", protect, submitController.submitTest);

module.exports = router;
