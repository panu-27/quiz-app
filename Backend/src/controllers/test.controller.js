const Test = require("../models/Test");

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTests = async (req, res) => {
  const tests = await Test.find().sort({ createdAt: -1 });
  res.json(tests);
};
