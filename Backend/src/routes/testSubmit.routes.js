const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {submitTest} = require("../controllers/testSubmit.controller");

router.post("/:testId", protect, submitTest);

module.exports = router;
