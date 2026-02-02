import * as service from "./teacher.service.js";

/* ---------------- GET TEACHER BATCHES ---------------- */
export const getMyBatches = async (req, res) => {
  try {
    const batches = await service.getMyBatches(req.user);
    res.json(batches);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

/* ---------------- CREATE PDF TEST (UNCHANGED) ---------------- */
export const createTest = async (req, res) => {
  try {
    const test = await service.createTest(req.user, req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- CREATE CUSTOM TEST ---------------- */
export const createCustomTest = async (req, res) => {
  try {
    const test = await service.createCustomTest(req.user, req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- GENERATE CUSTOM TEST ---------------- */
export const generateCustomTest = async (req, res) => {
  try {
    const test = await service.generateCustomTest(
      req.user,
      req.params.id
    );
    res.json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
