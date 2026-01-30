const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getMyAttempts } = require("../controllers/student.controller");

router.get("/attempts", protect, getMyAttempts);

module.exports = router;
