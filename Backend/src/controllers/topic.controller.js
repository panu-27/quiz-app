const Topic = require("../models/Topic");

exports.createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTopicsByChapter = async (req, res) => {
  try {
    const topics = await Topic.find({ chapterId: req.params.chapterId });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createTopicsBulk = async (req, res) => {
  try {
    const { chapterId, topics } = req.body;

    if (!chapterId || !Array.isArray(topics)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const docs = topics.map(name => ({
      name,
      chapterId
    }));

    const created = await Topic.insertMany(docs);

    res.status(201).json({
      message: "Topics created successfully",
      count: created.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
