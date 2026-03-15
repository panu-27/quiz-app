import express from "express";
import {
  getPYQChapters,
  getPYQTopics,
  getPYQQuestions
} from "./pyq.controller.js";
import PYQ from "../questionBank/PYQ.js";


const router = express.Router();

router.get("/:subjectId/chapters", getPYQChapters);
router.get("/:subjectId/chapters/:chapterId/topics", getPYQTopics);
router.get("/:subjectId/chapters/:chapterId/topics/:topicId/questions", getPYQQuestions);
router.post("/add-question", async (req,res)=>{
try{

const question = await PYQ.create(req.body)

res.json({
message:"Question added",
data:question
})

}catch(err){
res.status(500).json({error:err.message})
}
})
router.post("/bulk-add", async (req, res) => {
  try {

    const questions = await PYQ.insertMany(req.body);

    res.json({
      message: "Questions added",
      count: questions.length,
      data: questions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;