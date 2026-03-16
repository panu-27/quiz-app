import mongoose from "mongoose";
import Leaderboard       from "../test/leaderboard.model.js";
import WeeklyLeaderboard from "./weeklyLeaderboard.model.js";
import TestAttempt       from "../test/testAttempt.model.js";
import Test              from "../test/test.model.js";
import User              from "../user/user.model.js";

const LOOKBACK_DAYS          = 7;
const TOTAL_STATE_CANDIDATES = 100000;
const SCORE_WEIGHT           = 0.80;
const PARTICIPATION_WEIGHT   = 0.20;

/* ─────────────────────────────────────────────────────────
   HELPER — compute max marks for one test from its schema
───────────────────────────────────────────────────────── */
function computeMaxScore(test) {
  const ms             = test.markingScheme || {};
  const defaultCorrect = ms.defaultCorrect ?? 1;

  const subjectWiseMap = {};
  for (const sw of ms.subjectWise || []) {
    if (sw.subjectId)
      subjectWiseMap[sw.subjectId.toString()] = sw.correctMarks ?? defaultCorrect;
  }

  let max = 0;
  for (const block of test.blocks || []) {
    for (const sec of block.sections || []) {
      const marks = sec.subject
        ? (subjectWiseMap[sec.subject.toString()] ?? defaultCorrect)
        : defaultCorrect;
      max += (sec.numQuestions || 0) * marks;
    }
  }
  return max;
}

/* ─────────────────────────────────────────────────────────
   HELPER — MHT-CET style percentile compression
───────────────────────────────────────────────────────── */
function compressPercentile(raw) {
  let p = raw;
  if      (p > 95) p = 95 + (p - 95) * 0.3;
  else if (p > 80) p = 80 + (p - 80) * 0.6;
  return Math.min(99.99, p);
}

/* ─────────────────────────────────────────────────────────
   1. GENERATE WEEKLY STATS  (cron target)
───────────────────────────────────────────────────────── */
export const generateWeeklyStats = async (req, res) => {
  try {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - LOOKBACK_DAYS);

    // ── Step 1: all completed first attempts in the window ──
    const attempts = await TestAttempt.find({
      createdAt:     { $gte: windowStart },
      status:        "completed",
      attemptNumber: 1,
    }).lean();

    if (!attempts.length)
      return res.status(200).json({ message: "No data in window" });

    // ── Step 2: fetch every test those attempts reference ──
    const testIds = [...new Set(attempts.map(a => a.testId.toString()))];
    const tests   = await Test.find({ _id: { $in: testIds } }).lean();

    // ── Step 3: testId → maxScore ──
    const maxScoreMap = {};
    for (const test of tests) {
      const max = computeMaxScore(test);
      maxScoreMap[test._id.toString()] = max > 0 ? max : null;
    }

    // ── Step 4: eligibility — ONE query, not N ──
    //
    // Collect every batchId referenced by any scoreable test,
    // then pull all students in those batches in a single query.
    // Build:  batchId  → Set<studentId string>
    //         studentId → eligible test count
    //
    // This replaces the old per-test loop that fired a DB call
    // for each test (N+1 problem).

    // 4a. which batchIds matter?
    const scoreableTests = tests.filter(t => maxScoreMap[t._id.toString()]);

    const allBatchIds = [
      ...new Set(
        scoreableTests.flatMap(t => t.batches.map(b => b.toString()))
      ),
    ];

    // 4b. single query — get every student in any of those batches
    const eligibleStudents = await User.find({
      batchId: { $in: allBatchIds },
      role:    "STUDENT",
    }).select("_id batchId").lean();

    // 4c. batchId → Set of studentId strings
    const batchToStudents = {};
    for (const student of eligibleStudents) {
      const bid = student.batchId.toString();
      if (!batchToStudents[bid]) batchToStudents[bid] = new Set();
      batchToStudents[bid].add(student._id.toString());
    }

    // 4d. studentId → how many scoreable tests they were eligible for
    const eligibleTestCount = {};
    for (const test of scoreableTests) {
      for (const bid of test.batches) {
        const students = batchToStudents[bid.toString()] || new Set();
        for (const sid of students) {
          eligibleTestCount[sid] = (eligibleTestCount[sid] || 0) + 1;
        }
      }
    }

    // ── Step 5: aggregate per student ──
    const studentMap = {};

    for (const attempt of attempts) {
      const sid    = attempt.studentId.toString();
      const tid    = attempt.testId.toString();
      const maxPts = maxScoreMap[tid];
      if (!maxPts) continue;

      const normalizedPct = Math.min(100, (attempt.totalScore / maxPts) * 100);

      if (!studentMap[sid]) {
        studentMap[sid] = {
          normalizedScores: [],
          totalTime:        0,
          count:            0,
          totalCorrect:     0,
          totalWrong:       0,
        };
      }

      studentMap[sid].normalizedScores.push(normalizedPct);
      studentMap[sid].totalTime    += attempt.timeTaken    || 0;
      studentMap[sid].count        += 1;
      studentMap[sid].totalCorrect += attempt.totalCorrect || 0;
      studentMap[sid].totalWrong   += attempt.totalWrong   || 0;
    }

    if (!Object.keys(studentMap).length)
      return res.status(200).json({ message: "No scoreable data" });

    // ── Step 6: composite score ──
    const computed = Object.entries(studentMap).map(([sid, s]) => {
      const avgNormalizedPct =
        s.normalizedScores.reduce((a, b) => a + b, 0) / s.normalizedScores.length;

      // Uses THIS student's eligible count — never penalised for
      // tests that weren't assigned to their batch.
      const eligibleCount    = eligibleTestCount[sid] || s.count;
      const participationPct = Math.min(100, (s.count / eligibleCount) * 100);

      const compositeScore =
        avgNormalizedPct * SCORE_WEIGHT + participationPct * PARTICIPATION_WEIGHT;

      const avgTime = s.totalTime / s.count;

      // accuracy = correct / (correct + wrong) — skips don't count against you
      const attempted = s.totalCorrect + s.totalWrong;
      const accuracy  = attempted > 0
        ? Math.min(100, Math.round((s.totalCorrect / attempted) * 100))
        : 0;

      return { sid, compositeScore, avgNormalizedPct, avgTime, accuracy, s };
    });

    // ── Step 7: sort — composite → avg% → speed ──
    computed.sort((a, b) => {
      if (Math.abs(b.compositeScore - a.compositeScore) > 0.001)
        return b.compositeScore - a.compositeScore;
      if (Math.abs(b.avgNormalizedPct - a.avgNormalizedPct) > 0.001)
        return b.avgNormalizedPct - a.avgNormalizedPct;
      return a.avgTime - b.avgTime;
    });

    const totalStudents = computed.length;
    const bulkOps       = [];
    const weeklyDocs    = [];

    computed.forEach(
      ({ sid, compositeScore, avgTime, accuracy, s }, index) => {
        const rank = index + 1;

        const rawPercentile =
          ((totalStudents - rank) / totalStudents) * 100;
        const percentile = compressPercentile(rawPercentile);

        const predictedStateRank = Math.max(
          1,
          Math.floor(((100 - percentile) / 100) * TOTAL_STATE_CANDIDATES)
        );

        const progress = Math.min(100, s.count * 15);

        weeklyDocs.push({
          studentId:      new mongoose.Types.ObjectId(sid),
          totalScore:     parseFloat(compositeScore.toFixed(2)),
          averageTime:    Math.round(avgTime),
          testsAttempted: s.count,
          rank,
          weekEnding:     new Date(),
        });

        bulkOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(sid) },
            update: {
              $set: {
                "stats.instRank":   rank.toString(),
                "stats.classRank":  rank.toString(),
                "stats.stateRank":  predictedStateRank.toLocaleString(),
                "stats.percentile": percentile.toFixed(2),
                "stats.accuracy":   accuracy,
                "stats.progress":   progress,
              },
            },
          },
        });
      }
    );

    // ── Step 8: atomic writes ──
    await Promise.all([
      User.bulkWrite(bulkOps),
      WeeklyLeaderboard.deleteMany({}).then(() =>
        WeeklyLeaderboard.insertMany(weeklyDocs)
      ),
    ]);

    res.status(200).json({
      message:       "Weekly sync complete",
      students:      totalStudents,
      testsInWindow: testIds.length,
    });

  } catch (err) {
    console.error("Weekly sync failed:", err);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   2. GET MY STATS  (profile page)
───────────────────────────────────────────────────────── */
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user   = await User.findById(userId).select("stats").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.stats || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   3. WEEKLY LEADERBOARD  (full list)
───────────────────────────────────────────────────────── */
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const loggedUserId = (req.user?.id || req.user?._id)?.toString();

    const rankings = await WeeklyLeaderboard.find()
      .populate("studentId", "name profilePic stats") // ✅ added stats
      .sort({ rank: 1 })
      .lean();

    const total = rankings.length;

    res.json(
      rankings.map(entry => {
        const userStats = entry.studentId?.stats || {};

        const computedPercentile = total > 1
          ? parseFloat((((total - entry.rank) / (total - 1)) * 100).toFixed(1))
          : 100;

        return {
          studentId: entry.studentId?._id,
          rank: entry.rank,
          name: entry.studentId?.name || "Unknown",
          points: entry.totalScore || 0,
          avatar: entry.studentId?.profilePic || null,
          current: entry.studentId?._id?.toString() === loggedUserId,
          stats: {
            stateRank:  userStats.stateRank  ?? "N/A",
            instRank:   userStats.instRank   ?? "N/A",
            percentile: userStats.percentile ?? computedPercentile,
            accuracy:   userStats.accuracy   ?? 0,
            progress:   userStats.progress   ?? 0,
          }
        };
      })
    );
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};

/* ─────────────────────────────────────────────────────────
   4. TOP RANK  (podium / hero widget)
───────────────────────────────────────────────────────── */
export const getTopRank = async (req, res) => {
  try {
    const top = await WeeklyLeaderboard.findOne({ rank: 1 })
      .populate("studentId", "name profilePic")
      .lean();

    if (!top) return res.json(null);

    res.json({
      name:   top.studentId?.name,
      avatar: top.studentId?.profilePic,
      points: top.totalScore,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching top rank" });
  }
};

/* ─────────────────────────────────────────────────────────
   5. TEST-SPECIFIC LEADERBOARD
───────────────────────────────────────────────────────── */
export const getTestLeaderboard = async (req, res) => {
  try {
    const { testId }     = req.params;
    const loggedUserId   = (req.user?.id || req.user?._id)?.toString();

    if (!mongoose.Types.ObjectId.isValid(testId))
      return res.status(400).json({ message: "Invalid test ID" });

    const leaderboard = await Leaderboard.find({
      testId: new mongoose.Types.ObjectId(testId),
    })
      .populate("studentId", "name profilePic")
      .sort({ score: -1, timeTaken: 1 })
      .lean();

    res.json(
      leaderboard.map((entry, index) => ({
        rank:    index + 1,
        name:    entry.studentId?.name        || "Unknown",
        points:  entry.score.toString(),
        avatar:  entry.studentId?.profilePic  || null,
        current: entry.studentId?._id?.toString() === loggedUserId,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Error fetching test leaderboard" });
  }
};