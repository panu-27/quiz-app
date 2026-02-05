import * as service from "./teacher.service.js";

import User from "../user/user.model.js"; // Adjust path as needed
import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";
import mongoose from "mongoose";
import Leaderboard from "../test/leaderboard.model.js";

export const getMyTests = async (req, res) => {
  try {
    // Only fetch necessary fields: Title, startTime, and mode
    const tests = await Test.find({ teacherId: req.user.id })
      .select("title startTime mode examType")
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// teacher.controller.js
export const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user.id;

    // 1. Hard Check: Is testId a valid MongoDB ObjectId?
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid Test ID format" });
    }

    const test = await Test.findOne({ _id: testId, teacherId }).populate("batches");
    if (!test) return res.status(404).json({ message: "Test not found or unauthorized" });

    // 2. Get Leaderboard
    const leaderboard = await Leaderboard.find({ testId })
      .populate("studentId", "name email profileImage")
      .sort({ score: -1, timeTaken: 1 });

    // 3. Robust Absentee Calculation
    const assignedBatchIds = test.batches.map(b => b._id);
    
    // Find all students in these batches
    const allEligibleStudents = await User.find({
      batches: { $in: assignedBatchIds },
      role: "STUDENT"
    }).select("name email");

    // Use a Set for faster lookup
    const attendedIds = new Set(leaderboard.map(l => l.studentId?._id?.toString()));
    
    const absentees = allEligibleStudents.filter(
      s => !attendedIds.has(s._id.toString())
    );

    // 4. Safe Stat calculation (Handle 0 attended students)
    const attendedCount = attendedIds.size;
    const totalCount = allEligibleStudents.length || 0;
    const avgScore = attendedCount > 0 
      ? leaderboard.reduce((acc, curr) => acc + (curr.score || 0), 0) / attendedCount 
      : 0;

    res.json({
      testTitle: test.title,
      stats: {
        totalEligible: totalCount,
        attended: attendedCount,
        absent: absentees.length,
        averageScore: parseFloat(avgScore.toFixed(2)),
        attendancePercentage: totalCount > 0 ? ((attendedCount / totalCount) * 100).toFixed(1) + "%" : "0%"
      },
      leaderboard: leaderboard.filter(l => l.studentId), // Filter out any null students
      absentees
    });
  } catch (err) {
    console.error("DETAILED ERROR:", err); // This will show in your terminal
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


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