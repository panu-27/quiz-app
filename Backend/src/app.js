const express = require("express");
const cors = require("cors");





const app = express();

app.use(cors());
app.use(express.json());

const Subject = require("./models/Subject");
const Chapter = require("./models/Chapter");
const Topic = require("./models/Topic");
const Question = require("./models/Question");



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
app.post("/api/seed/generate-dummy", async (req, res) => {
  const { examType, subjects, topicsPerChapter, questionsPerTopic } = req.body;

  const result = [];

  for (const sub of subjects) {
    const subject = await Subject.create({
      name: sub.name,
      examType
    });

    const subjectData = {
      subject: subject.name,
      subjectId: subject._id,
      chapters: []
    };

    for (const chapName of sub.chapters) {
      const chapter = await Chapter.create({
        subjectId: subject._id,
        name: chapName,
        cetWeightage: 1
      });

      const chapterData = {
        chapter: chapName,
        chapterId: chapter._id,
        topics: []
      };

      for (let t = 1; t <= topicsPerChapter; t++) {
        const topicName = `${chapName} t${t}`;

        const topic = await Topic.create({
          chapterId: chapter._id,
          name: topicName
        });

        const topicData = {
          topic: topicName,
          topicId: topic._id,
          questions: []
        };

        for (let q = 1; q <= questionsPerTopic; q++) {
          const questionText = `${topicName} q${q}`;

          // ✅ Difficulty distribution
          let difficulty = "easy";
          const ratio = q / questionsPerTopic;

          if (ratio > 0.8) difficulty = "hard";
          else if (ratio > 0.5) difficulty = "medium";

          const options = [
            { text: `${questionText} option A` },
            { text: `${questionText} option B` }, // correct
            { text: `${questionText} option C` },
            { text: `${questionText} option D` }
          ];

          const question = await Question.create({
            subjectId: subject._id,
            chapterId: chapter._id,
            topicId: topic._id,
            questionText,
            options,
            correctOption: 1,
            difficulty,
            marks: 1
          });

          topicData.questions.push(question._id);
        }

        chapterData.topics.push(topicData);
      }

      subjectData.chapters.push(chapterData);
    }

    result.push(subjectData);
  }

  res.json({
    message: "Dummy data generated successfully with difficulty distribution",
    structure: result
  });
});



module.exports = app;
