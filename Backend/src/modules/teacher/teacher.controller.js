import * as service from "./teacher.service.js";

import User from "../user/user.model.js"; // Adjust path as needed
import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";
import mongoose from "mongoose";
import Leaderboard from "../test/leaderboard.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import Resource from "./Resource.js";

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
 
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid Test ID format" });
    }
 
    // Explicit ObjectId cast — prevents silent string/ObjectId mismatch
    const testObjectId = new mongoose.Types.ObjectId(testId);
 
    const test = await Test.findOne({ _id: testObjectId, teacherId }).populate("batches");
    if (!test) return res.status(404).json({ message: "Test not found or unauthorized" });
 
    const examType = test.examType;
 
    // ─────────────────────────────────────────────────────────────
    // 1. Only completed first attempts — source of truth for
    //    both the leaderboard AND attendance detection
    // ─────────────────────────────────────────────────────────────
    const completedAttempts = await TestAttempt.find({
      testId: testObjectId,
      status: "completed",
      attemptNumber: 1,
    })
      .populate("studentId", "name email profilePic")
      .sort({ totalScore: -1, timeTaken: 1 });
 
    const attendedIds = new Set(
      completedAttempts.map((a) => a.studentId?._id?.toString()).filter(Boolean)
    );
 
    // ─────────────────────────────────────────────────────────────
    // 2. Eligible students for absentee calculation
    //    NOTE: User schema has batchId (singular) — read students
    //    from Batch.students[] array instead
    // ─────────────────────────────────────────────────────────────
 
    // Helper: given batch docs, collect all unique student IDs
    // from Batch.students[] then fetch those User documents
    const getStudentsFromBatches = async (batchDocs) => {
      const studentIds = [
        ...new Set(
          batchDocs.flatMap((b) => (b.students || []).map((id) => id.toString()))
        ),
      ];
      if (studentIds.length === 0) return [];
      return User.find({ _id: { $in: studentIds } }).select("name email profilePic");
    };
 
    let allEligibleStudents = [];
 
    if (examType !== "OTHER") {
      // PCM / PCB / PCMB / JEE / NEET:
      // All students from ALL batches assigned to this test
      allEligibleStudents = await getStudentsFromBatches(test.batches);
    } else {
      // OTHER (single-subject exams):
      // Step 1 — detect subject(s) from test sections
      // Step 2 — map subject → which MHT_CET batch types are eligible
      // Step 3 — find those batches in the institute → get their students
 
      const subjectNames = new Set();
      for (const block of test.blocks || []) {
        for (const sec of block.sections || []) {
          if (sec.subjectName) subjectNames.add(sec.subjectName.toLowerCase().trim());
        }
      }
 
      // Subject → batch pattern mapping:
      // Physics / Chemistry → PCM + PCB + PCMB
      // Maths               → PCM + PCMB
      // Biology             → PCB + PCMB
      const batchPatterns = new Set();
      for (const name of subjectNames) {
        if (name.includes("phy")) {
          batchPatterns.add("PCM");
          batchPatterns.add("PCB");
          batchPatterns.add("PCMB");
        }
        if (name.includes("chem")) {
          batchPatterns.add("PCM");
          batchPatterns.add("PCB");
          batchPatterns.add("PCMB");
        }
        if (name.includes("math")) {
          batchPatterns.add("PCM");
          batchPatterns.add("PCMB");
        }
        if (name.includes("bio")) {
          batchPatterns.add("PCB");
          batchPatterns.add("PCMB");
        }
      }
 
      if (batchPatterns.size === 0) {
        // Unrecognised subject — fallback to assigned batches
        allEligibleStudents = await getStudentsFromBatches(test.batches);
      } else {
        // Word-boundary regex: "PCM" matches "MHT_CET PCM" but NOT "MHT_CET PCMB"
        const regexList = [...batchPatterns].map(
          (p) => new RegExp(`(?<![A-Z])${p}(?![A-Z])`, "i")
        );
 
        // Fetch ALL batches for this institute — not just assigned ones,
        // because for OTHER exams the test may not be assigned to all
        // relevant batches
        const allInstituteBatches = await Batch.find({
          instituteId: test.instituteId,
        }).select("_id name students");
 
        const matchedBatches = allInstituteBatches.filter((b) =>
          regexList.some((rx) => rx.test(b.name))
        );
 
        allEligibleStudents = await getStudentsFromBatches(matchedBatches);
      }
    }
 
    // Deduplicate — a student can appear in multiple batches
    const seen = new Set();
    allEligibleStudents = allEligibleStudents.filter((s) => {
      const id = s._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
 
    const absentees = allEligibleStudents.filter(
      (s) => !attendedIds.has(s._id.toString())
    );
 
    // ─────────────────────────────────────────────────────────────
    // 3. Leaderboard with flat per-subject scores
    // ─────────────────────────────────────────────────────────────
    const leaderboard = completedAttempts
      .filter((a) => a.studentId)
      .map((a) => {
        const subjectScores = [];
        for (const block of a.blocks || []) {
          for (const sec of block.sections || []) {
            subjectScores.push({
              blockName:   block.blockName,
              subjectName: sec.subjectName || block.blockName || "Section",
              score:       sec.score       ?? 0,
              correct:     sec.correct     ?? 0,
              wrong:       sec.wrong       ?? 0,
              unattempted: sec.unattempted ?? 0,
            });
          }
        }
        return {
          _id:              a._id,
          studentId:        a.studentId,
          score:            a.totalScore,
          timeTaken:        a.timeTaken,
          totalCorrect:     a.totalCorrect,
          totalWrong:       a.totalWrong,
          totalUnattempted: a.totalUnattempted,
          subjectScores,
        };
      });
 
    // ─────────────────────────────────────────────────────────────
    // 4. maxScore — numQuestions × correctMarks per section
    //    Uses subjectWise marking if defined for that subject,
    //    otherwise falls back to markingScheme.defaultCorrect
    // ─────────────────────────────────────────────────────────────
    const markingScheme  = test.markingScheme || {};
    const defaultCorrect = markingScheme.defaultCorrect ?? 1;
 
    // Build lookup: subjectId (string) → correctMarks
    const subjectWiseMap = {};
    for (const sw of markingScheme.subjectWise || []) {
      if (sw.subjectId) {
        subjectWiseMap[sw.subjectId.toString()] = sw.correctMarks ?? defaultCorrect;
      }
    }
 
    const maxScore = (test.blocks || []).reduce((total, block) => {
      return (
        total +
        (block.sections || []).reduce((blockTotal, sec) => {
          const correctMarks = sec.subject
            ? (subjectWiseMap[sec.subject.toString()] ?? defaultCorrect)
            : defaultCorrect;
          return blockTotal + (sec.numQuestions || 0) * correctMarks;
        }, 0)
      );
    }, 0);
 
    // ─────────────────────────────────────────────────────────────
    // 5. Stats
    // ─────────────────────────────────────────────────────────────
    const attendedCount = attendedIds.size;
    const totalCount    = allEligibleStudents.length;
    const avgScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce((acc, a) => acc + (a.totalScore || 0), 0) /
          completedAttempts.length
        : 0;
 
    // ─────────────────────────────────────────────────────────────
    // 6. coachingName — look up Institute by test.instituteId
    // ─────────────────────────────────────────────────────────────
    let coachingName = "Coaching";
    try {
      const Institute = mongoose.model("Institute");
      const institute = await Institute.findById(test.instituteId).select("name");
      if (institute?.name) coachingName = institute.name;
    } catch (_) {
      // Institute model not registered or not found — keep default
    }
 
    // ─────────────────────────────────────────────────────────────
    // 7. Block structure for frontend column headers
    // ─────────────────────────────────────────────────────────────
    const blockStructure = (test.blocks || []).map((b) => ({
      blockName: b.blockName,
      sections: (b.sections || []).map((s) => ({
        subjectName: s.subjectName || b.blockName || "Section",
      })),
    }));
 
    res.json({
      testTitle: test.title,
      examType,
      maxScore,
      coachingName,
      stats: {
        totalEligible:        totalCount,
        attended:             attendedCount,
        absent:               absentees.length,
        averageScore:         parseFloat(avgScore.toFixed(2)),
        attendancePercentage:
          totalCount > 0
            ? ((attendedCount / totalCount) * 100).toFixed(1) + "%"
            : "0%",
      },
      leaderboard,
      absentees,
      blockStructure,
    });
 
  } catch (err) {
    console.error("DETAILED ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// get performace 
// Route: GET /teacher/performance-overview
// Add to teacher.controller.js

export const getPerformanceOverview = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const tests = await Test.find({ teacherId })
      .populate("batches")
      .sort({ startTime: 1 });

    if (tests.length === 0) {
      return res.json({
        summary: { totalTests: 0, totalStudents: 0, batchTrajectory: "neutral", trajectoryPct: 0, overallAttendance: "0%" },
        insights: [],
        testTrend: [],
        studentRisk: [],
        subjectHealth: [],
      });
    }

    const testIds = tests.map(t => t._id);

    const allAttempts = await TestAttempt.find({
      testId: { $in: testIds },
      status: "completed",
      attemptNumber: 1,
    }).populate("studentId", "name email");

    // ── helpers ──
    const stdDev = (arr) => {
      if (arr.length < 2) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
    };

    const getStudentsFromBatches = async (batchDocs) => {
      const ids = [...new Set(batchDocs.flatMap(b => (b.students || []).map(id => id.toString())))];
      if (!ids.length) return [];
      return User.find({ _id: { $in: ids } }).select("_id name profilePic");
    };

    const getEligibleForTest = async (test) => {
      if (test.examType !== "OTHER") return getStudentsFromBatches(test.batches);
      const subjectNames = new Set();
      for (const block of test.blocks || [])
        for (const sec of block.sections || [])
          if (sec.subjectName) subjectNames.add(sec.subjectName.toLowerCase().trim());
      const batchPatterns = new Set();
      for (const name of subjectNames) {
        if (name.includes("phy") || name.includes("chem")) { batchPatterns.add("PCM"); batchPatterns.add("PCB"); batchPatterns.add("PCMB"); }
        if (name.includes("math")) { batchPatterns.add("PCM"); batchPatterns.add("PCMB"); }
        if (name.includes("bio"))  { batchPatterns.add("PCB"); batchPatterns.add("PCMB"); }
      }
      if (!batchPatterns.size) return getStudentsFromBatches(test.batches);
      const regexList = [...batchPatterns].map(p => new RegExp(`(?<![A-Z])${p}(?![A-Z])`, "i"));
      const all = await Batch.find({ instituteId: test.instituteId }).select("_id name students");
      return getStudentsFromBatches(all.filter(b => regexList.some(rx => rx.test(b.name))));
    };

    const getMaxScore = (test) => {
      const ms = test.markingScheme || {};
      const dc = ms.defaultCorrect ?? 1;
      const swm = {};
      for (const sw of ms.subjectWise || [])
        if (sw.subjectId) swm[sw.subjectId.toString()] = sw.correctMarks ?? dc;
      return (test.blocks || []).reduce((t, block) =>
        t + (block.sections || []).reduce((bt, sec) => {
          const cm = sec.subject ? (swm[sec.subject.toString()] ?? dc) : dc;
          return bt + (sec.numQuestions || 0) * cm;
        }, 0), 0);
    };

    // attemptsByTest
    const attemptsByTest = {};
    for (const a of allAttempts) {
      const key = a.testId.toString();
      if (!attemptsByTest[key]) attemptsByTest[key] = [];
      attemptsByTest[key].push(a);
    }

    // ── testTrend + absenteesByTest ──
    const testTrend = [];
    const absenteesByTest = {}; // testId → Set<studentId string>

    for (const test of tests) {
      const tid      = test._id.toString();
      const attempts = attemptsByTest[tid] || [];
      const eligible = await getEligibleForTest(test);
      const eligibleMap = {};
      for (const s of eligible) eligibleMap[s._id.toString()] = s;
      const eligibleList = Object.values(eligibleMap);
      const attendedIds  = new Set(attempts.map(a => a.studentId?._id?.toString()).filter(Boolean));
      const absentIds    = eligibleList.filter(s => !attendedIds.has(s._id.toString())).map(s => s._id.toString());
      absenteesByTest[tid] = { absentSet: new Set(absentIds), eligibleMap };

      const maxScore = getMaxScore(test);
      const avgScore = attempts.length
        ? attempts.reduce((acc, a) => acc + (a.totalScore || 0), 0) / attempts.length
        : 0;

      testTrend.push({
        testId: tid,
        title: test.title,
        examType: test.examType,
        date: test.startTime,
        attended: attendedIds.size,
        eligible: eligibleList.length,
        avgScore: parseFloat(avgScore.toFixed(2)),
        maxScore,
        avgPct: maxScore > 0 ? parseFloat(((avgScore / maxScore) * 100).toFixed(1)) : 0,
        attendanceRate: eligibleList.length > 0
          ? parseFloat(((attendedIds.size / eligibleList.length) * 100).toFixed(1))
          : 0,
      });
    }

    // ── BATCH TRAJECTORY ──
    // Compare avg% of first half vs second half of tests
    let batchTrajectory = "neutral";
    let trajectoryPct   = 0;
    if (testTrend.length >= 2) {
      const half    = Math.ceil(testTrend.length / 2);
      const first   = testTrend.slice(0, half).filter(t => t.avgPct > 0);
      const second  = testTrend.slice(half).filter(t => t.avgPct > 0);
      if (first.length && second.length) {
        const firstAvg  = first.reduce((s, t) => s + t.avgPct, 0)  / first.length;
        const secondAvg = second.reduce((s, t) => s + t.avgPct, 0) / second.length;
        trajectoryPct   = parseFloat((secondAvg - firstAvg).toFixed(1));
        batchTrajectory = trajectoryPct > 3 ? "improving" : trajectoryPct < -3 ? "declining" : "stable";
      }
    } else if (testTrend.length === 1) {
      batchTrajectory = "neutral";
    }

    // ── STUDENT DATA: per-test scores in chronological order ──
    // studentTimeline: studentId → [{testId, testIdx, scorePct}]
    const studentTimeline = {};
    const studentMeta     = {};

    for (let i = 0; i < tests.length; i++) {
      const tid      = tests[i]._id.toString();
      const attempts = attemptsByTest[tid] || [];
      const maxScore = testTrend[i].maxScore;

      for (const a of attempts) {
        if (!a.studentId) continue;
        const sid = a.studentId._id.toString();
        if (!studentTimeline[sid]) {
          studentTimeline[sid] = [];
          studentMeta[sid] = {
            name: a.studentId.name,
            profilePic: a.studentId.profilePic,
            totalCorrect: 0, totalWrong: 0, totalUnattempted: 0,
            testsAttempted: 0, absentCount: 0,
          };
        }
        const scorePct = maxScore > 0 ? (a.totalScore / maxScore) * 100 : 0;
        studentTimeline[sid].push({ testIdx: i, testId: tid, scorePct, rawScore: a.totalScore, maxScore });
        studentMeta[sid].totalCorrect      += a.totalCorrect      || 0;
        studentMeta[sid].totalWrong        += a.totalWrong        || 0;
        studentMeta[sid].totalUnattempted  += a.totalUnattempted  || 0;
        studentMeta[sid].testsAttempted    += 1;
      }
    }

    // Count absences
    for (const [tid, { absentSet }] of Object.entries(absenteesByTest)) {
      for (const sid of absentSet) {
        if (!studentMeta[sid]) {
          // Only absent, never attempted — get name from eligible map
          const eligible = absenteesByTest[tid].eligibleMap[sid];
          if (eligible) {
            studentMeta[sid] = { name: eligible.name, profilePic : eligible.profilePic , totalCorrect: 0, totalWrong: 0, totalUnattempted: 0, testsAttempted: 0, absentCount: 0 };
            studentTimeline[sid] = [];
          }
        }
        if (studentMeta[sid]) studentMeta[sid].absentCount += 1;
      }
    }

    // ── CLASSIFY STUDENT TREND ──
    // RISING: avg of last half > avg of first half by >5pct
    // FALLING: avg of last half < avg of first half by >5pct
    // VOLATILE: stdDev of scorePcts > 15
    // CONSISTENT: stdDev < 8, attempted >= 2
    // NEW: only 1 test
    const classifyTrend = (timeline) => {
      if (timeline.length === 0) return "absent";
      if (timeline.length === 1) return "new";
      const pcts  = timeline.map(t => t.scorePct);
      const sd    = stdDev(pcts);
      const half  = Math.ceil(pcts.length / 2);
      const first = pcts.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const last  = pcts.slice(half).reduce((a, b) => a + b, 0) / (pcts.length - half);
      const diff  = last - first;
      if (sd > 18) return "volatile";
      if (diff >  5) return "rising";
      if (diff < -5) return "falling";
      return "consistent";
    };

    // ── RISK SCORE ──
    // Factors: score percentile (0–40), absence rate (0–30), trend (0–30)
    // Higher = more at risk
    const allAvgPcts = Object.entries(studentTimeline)
      .filter(([, tl]) => tl.length > 0)
      .map(([sid, tl]) => ({ sid, avg: tl.reduce((s, t) => s + t.scorePct, 0) / tl.length }));
    allAvgPcts.sort((a, b) => a.avg - b.avg);
    const pctileMap = {};
    allAvgPcts.forEach(({ sid }, i) => {
      pctileMap[sid] = allAvgPcts.length > 1
        ? Math.round((i / (allAvgPcts.length - 1)) * 100)
        : 50;
    });

    const studentRisk = Object.keys(studentMeta).map(sid => {
      const meta     = studentMeta[sid];
      const timeline = studentTimeline[sid] || [];
      const trend    = classifyTrend(timeline);
      const avgPct   = timeline.length > 0 ? timeline.reduce((s, t) => s + t.scorePct, 0) / timeline.length : 0;
      const absRate  = tests.length > 0 ? (meta.absentCount / tests.length) * 100 : 0;
      const scorePct = pctileMap[sid] ?? 50;

      // Risk score 0–100
      const scoreRisk   = Math.max(0, 100 - scorePct);          // low percentile = high risk
      const absRisk     = Math.min(100, absRate * 1.5);          // >66% absent = max
      const trendRisk   = trend === "falling" ? 80 : trend === "volatile" ? 50 : trend === "absent" ? 100 : 0;
      const riskScore   = Math.round(scoreRisk * 0.4 + absRisk * 0.35 + trendRisk * 0.25);

      const riskLevel   = riskScore >= 65 ? "HIGH" : riskScore >= 35 ? "MEDIUM" : "SAFE";

      // Human-readable reason
      const reasons = [];
      if (trend === "falling")   reasons.push("Score declining");
      if (trend === "volatile")  reasons.push("Inconsistent performance");
      if (absRate >= 40)         reasons.push(`Absent ${meta.absentCount}/${tests.length} tests`);
      if (avgPct < 35 && timeline.length > 0) reasons.push("Consistently low scores");
      if (trend === "absent")    reasons.push("Never attempted");

      return {
        studentId:      sid,
        name:           meta.name,
        profilePic : meta.profilePic,
        trend,
        riskLevel,
        riskScore,
        avgPct:         parseFloat(avgPct.toFixed(1)),
        absentCount:    meta.absentCount,
        testsAttempted: meta.testsAttempted,
        totalTests:     tests.length,
        accuracy:       (meta.totalCorrect + meta.totalWrong) > 0
          ? Math.round((meta.totalCorrect / (meta.totalCorrect + meta.totalWrong)) * 100)
          : 0,
        reason:         reasons.join(" · ") || "Performing well",
        // sparkline: last 5 score%s in order
        sparkline:      timeline.slice(-5).map(t => parseFloat(t.scorePct.toFixed(1))),
      };
    }).sort((a, b) => b.riskScore - a.riskScore);

    // ── SUBJECT HEALTH ──
    const subjectAgg = {};
    // Also track per-test to find trend (latest test vs earlier)
    const subjectByTest = {}; // subjectName → {testIdx → {correct, wrong, unattempted}}

    for (let i = 0; i < tests.length; i++) {
      const tid      = tests[i]._id.toString();
      const attempts = attemptsByTest[tid] || [];
      for (const a of attempts) {
        for (const block of a.blocks || []) {
          for (const sec of block.sections || []) {
            const name = sec.subjectName || block.blockName || "Section";
            if (!subjectAgg[name]) subjectAgg[name] = { correct: 0, wrong: 0, unattempted: 0, scoreSum: 0, count: 0 };
            subjectAgg[name].correct      += sec.correct     || 0;
            subjectAgg[name].wrong        += sec.wrong       || 0;
            subjectAgg[name].unattempted  += sec.unattempted || 0;
            subjectAgg[name].scoreSum     += sec.score       || 0;
            subjectAgg[name].count        += 1;

            if (!subjectByTest[name]) subjectByTest[name] = {};
            if (!subjectByTest[name][i]) subjectByTest[name][i] = { correct: 0, wrong: 0, total: 0 };
            subjectByTest[name][i].correct += sec.correct || 0;
            subjectByTest[name][i].wrong   += sec.wrong   || 0;
            subjectByTest[name][i].total   += (sec.correct || 0) + (sec.wrong || 0);
          }
        }
      }
    }

    const subjectHealth = Object.entries(subjectAgg).map(([name, d]) => {
      const accuracy    = (d.correct + d.wrong) > 0 ? Math.round((d.correct / (d.correct + d.wrong)) * 100) : 0;
      const totalQ      = d.correct + d.wrong + d.unattempted;
      const skipRate    = totalQ > 0 ? Math.round((d.unattempted / totalQ) * 100) : 0;
      const problem     = d.unattempted > d.wrong ? "conceptual_gap" : "practice_needed";

      // Trend: compare accuracy in last test vs first test for this subject
      const testIndices = Object.keys(subjectByTest[name] || {}).map(Number).sort((a,b)=>a-b);
      let subjectTrend  = "stable";
      if (testIndices.length >= 2) {
        const first = subjectByTest[name][testIndices[0]];
        const last  = subjectByTest[name][testIndices[testIndices.length - 1]];
        const firstAcc = first.total > 0 ? (first.correct / first.total) * 100 : 0;
        const lastAcc  = last.total  > 0 ? (last.correct  / last.total)  * 100 : 0;
        const diff = lastAcc - firstAcc;
        subjectTrend = diff > 5 ? "improving" : diff < -5 ? "declining" : "stable";
      }

      return {
        subjectName: name,
        accuracy,
        skipRate,
        problem,       // "conceptual_gap" | "practice_needed"
        subjectTrend,  // "improving" | "declining" | "stable"
        totalCorrect:  d.correct,
        totalWrong:    d.wrong,
        totalSkipped:  d.unattempted,
        avgScore:      d.count > 0 ? parseFloat((d.scoreSum / d.count).toFixed(1)) : 0,
      };
    }).sort((a, b) => a.accuracy - b.accuracy); // weakest first

    // ── SMART INSIGHT CARDS ──
    const insights = [];

    // 1. Batch trajectory
    if (batchTrajectory === "improving")
      insights.push({ type: "positive", icon: "trending_up",   text: `Batch is on the rise — avg scores up ${trajectoryPct}% in recent tests compared to earlier ones.` });
    else if (batchTrajectory === "declining")
      insights.push({ type: "warning",  icon: "trending_down", text: `Batch avg score has dropped ${Math.abs(trajectoryPct)}% over recent tests. Consider reviewing last 2 topics.` });

    // 2. Consecutive decline
    const lastThree = testTrend.filter(t => t.avgPct > 0).slice(-3);
    if (lastThree.length === 3 && lastThree[0].avgPct > lastThree[1].avgPct && lastThree[1].avgPct > lastThree[2].avgPct)
      insights.push({ type: "danger", icon: "alert", text: `3 tests in a row with declining avg scores. The batch needs immediate attention.` });

    // 3. Worst subject
    const worstSubject = subjectHealth[0];
    if (worstSubject && worstSubject.accuracy < 50) {
      const msg = worstSubject.problem === "conceptual_gap"
        ? `${worstSubject.skipRate}% of ${worstSubject.subjectName} questions are being skipped — students may have a conceptual gap, not just practice issues.`
        : `${worstSubject.subjectName} has the lowest accuracy at ${worstSubject.accuracy}%. High wrong count suggests students attempt but make errors — more practice needed.`;
      insights.push({ type: "warning", icon: "book", text: msg });
    }

    // 4. Subject declining trend
    const decliningSubject = subjectHealth.find(s => s.subjectTrend === "declining");
    if (decliningSubject)
      insights.push({ type: "warning", icon: "book", text: `${decliningSubject.subjectName} accuracy is declining test over test — scores were better in earlier tests.` });

    // 5. High-risk students count
    const highRisk = studentRisk.filter(s => s.riskLevel === "HIGH");
    if (highRisk.length > 0)
      insights.push({ type: "danger", icon: "users", text: `${highRisk.length} student${highRisk.length > 1 ? "s are" : " is"} at HIGH risk — ${highRisk.slice(0,2).map(s=>s.name).join(", ")}${highRisk.length > 2 ? ` +${highRisk.length-2} more` : ""}.` });

    // 6. Most improved student
    const mostImproved = [...studentRisk].filter(s => s.trend === "rising" && s.sparkline.length >= 2)
      .sort((a, b) => (b.sparkline[b.sparkline.length-1] - b.sparkline[0]) - (a.sparkline[a.sparkline.length-1] - a.sparkline[0]))[0];
    if (mostImproved)
      insights.push({ type: "positive", icon: "star", text: `${mostImproved.name} is showing the strongest improvement — score up from ${mostImproved.sparkline[0]}% to ${mostImproved.sparkline[mostImproved.sparkline.length-1]}%.` });

    // 7. Repeat absentees
    const seriousAbsent = studentRisk.filter(s => s.absentCount >= 2);
    if (seriousAbsent.length > 0)
      insights.push({ type: "danger", icon: "calendar", text: `${seriousAbsent.length} student${seriousAbsent.length > 1 ? "s have" : " has"} missed 2 or more tests: ${seriousAbsent.slice(0,2).map(s=>s.name).join(", ")}${seriousAbsent.length > 2 ? ` and ${seriousAbsent.length-2} more` : ""}.` });

    // 8. Attendance drop in latest test
    if (testTrend.length >= 2) {
      const latest = testTrend[testTrend.length - 1];
      const prev   = testTrend[testTrend.length - 2];
      if (prev.attendanceRate - latest.attendanceRate > 15)
        insights.push({ type: "warning", icon: "users", text: `Attendance dropped sharply in the latest test — ${latest.attendanceRate}% vs ${prev.attendanceRate}% in the previous one.` });
    }

    // ── Summary ──
    const totalAttended = testTrend.reduce((s, t) => s + t.attended, 0);
    const totalEligible = testTrend.reduce((s, t) => s + t.eligible, 0);

    res.json({
      summary: {
        totalTests:        tests.length,
        totalStudents:     Object.keys(studentMeta).length,
        batchTrajectory,
        trajectoryPct,
        overallAttendance: totalEligible > 0
          ? ((totalAttended / totalEligible) * 100).toFixed(1) + "%"
          : "0%",
        highRiskCount:     highRisk.length,
      },
      insights,      // smart callout cards
      testTrend,     // chronological per-test data
      studentRisk,   // per-student with trend + risk classification
      subjectHealth, // per-subject with problem type + trend
    });

  } catch (err) {
    console.error("PERFORMANCE OVERVIEW ERROR:", err);
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

export const craftTest = async (req, res) => {
  try {
    const test = await service.craftTest(req.user, req.body);
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



/* ---------------- GET CRAFTED TESTS ---------------- */
export const getCraftedTests = async (req, res) => {
  try {
    const tests = await service.getCraftedTests(req.user);
    res.status(200).json(tests);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- RESCHEDULE / REINITIALIZE TEST ---------------- */
export const scheduleTest = async (req, res) => {
  try {
    const test = await service.scheduleTest(req.user, req.body);
    res.status(200).json({ message: "Test rescheduled successfully", test });
  } catch (err) {
    const status = err.message.includes("unauthorized") || err.message.includes("Unauthorized") ? 403
                 : err.message.includes("not found") ? 404
                 : 400;
    res.status(status).json({ message: err.message });
  }
};



/* ─────────────────────────────────────────────────────────────
   DELETE /teacher/study-material/:id
───────────────────────────────────────────────────────────── */
export const deleteStudyMaterial = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { id }    = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid material ID" });
    }
 
    const material = await Resource.findOneAndDelete({
      _id:        id,
      uploadedBy: teacherId,   // teacher can only delete their own
    });
 
    if (!material) {
      return res.status(404).json({ message: "Material not found or unauthorized" });
    }
 
    res.json({ message: "Deleted successfully", id: material._id });
  } catch (err) {
    console.error("deleteStudyMaterial:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
 
/* ─────────────────────────────────────────────────────────────
   GET /teacher/study-material/:id  (single, for detail view)
───────────────────────────────────────────────────────────── */
export const getStudyMaterialById = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { id }    = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid material ID" });
    }
 
    const material = await Resource.findOne({ _id: id, uploadedBy: teacherId })
      .populate("batchIds", "name");
 
    if (!material) {
      return res.status(404).json({ message: "Material not found or unauthorized" });
    }
 
    res.json(material);
  } catch (err) {
    console.error("getStudyMaterialById:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


export const getStudyMaterials = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject, category, search } = req.query;
 
    const filter = { uploadedBy: teacherId };
    if (subject  && subject  !== "all") filter.subject  = subject;
    if (category && category !== "all") filter.category = category;
    if (search)  filter.title = { $regex: search.trim(), $options: "i" };
 
    const materials = await Resource.find(filter)
      .populate("batchIds", "name")   // get batch names for display
      .sort({ createdAt: -1 });
 
    res.json(materials);
  } catch (err) {
    console.error("getStudyMaterials:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};