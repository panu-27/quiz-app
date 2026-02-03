import * as service from "./teacher.service.js";

/* ---------------- GET TEACHER BATCHES ---------------- */
export const getMyBatches = async (req, res) => {
  try {
    // req.user is populated by your protect/auth middleware
    const batches = await service.getMyBatches(req.user);
    
    // Return an empty array instead of an error if no batches found
    res.status(200).json(batches || []); 
  } catch (err) {
    res.status(err.message === "Unauthorized" ? 401 : 400).json({
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


export const deployMaterial = async (req, res) => {
  try {
    const { subjectId, category, batchIds } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file provided" });
    if (!batchIds) return res.status(400).json({ message: "Please select at least one batch" });

    // FormData sends arrays as strings, we parse it back to an array
    const parsedBatchIds = typeof batchIds === 'string' ? JSON.parse(batchIds) : batchIds;

    const result = await service.deployMaterial(
      req.user,
      { subjectId, category, batchIds: parsedBatchIds },
      file
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};