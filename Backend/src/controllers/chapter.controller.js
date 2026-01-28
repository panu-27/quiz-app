const Chapter = require("../models/Chapter");

exports.createChapter = async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.status(201).json(chapter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getChaptersBySubject = async (req, res) => {
  try {
    const chapters = await Chapter.find({ subjectId: req.params.subjectId });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
