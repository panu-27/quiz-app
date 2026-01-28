const express = require("express");
const cors = require("cors");





const app = express();

app.use(cors());
app.use(express.json());




const subjectRoutes = require("./routes/subject.routes");
const chapterRoutes = require("./routes/chapter.routes");
const topicRoutes = require("./routes/topic.routes");
const questionRoutes = require("./routes/question.routes");
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const attemptRoutes = require("./routes/testAttempt.routes");
const submitRoutes = require("./routes/testSubmit.routes");
const analyticsRoutes = require("./routes/analytics.routes");



app.get("/", (req, res) => {
  res.send("QuizApp API running");
});
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/analytics", analyticsRoutes);


module.exports = app;
