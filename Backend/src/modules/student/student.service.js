import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";
import Leaderboard from "../test/leaderboard.model.js";
import mongoose from "mongoose";


/* ---------------- GET MY TESTS ---------------- */


export const getMyTests = async (jwtUser) => {
    const userId = jwtUser.id || jwtUser._id;

    // 1. Fetch student data
    const student = await User.findById(userId);

    if (!student || !student.batchId) {
        console.warn(`Student ${userId} has no batch assigned.`);
        return [];
    }

    const now = new Date();

    // 2. The "Active Window" Query
    // - Batch matches student's assigned batch
    // - Current time is GREATER THAN OR EQUAL to Start Time
    // - Current time is LESS THAN OR EQUAL to End Time
    return Test.find({
        batches: student.batchId,
        startTime: { $lte: now }, // Test has already started
        endTime: { $gte: now }    // Test has not yet ended
    })
        .select("_id title startTime endTime mode duration")
        .sort({ endTime: 1 }); // Sort by what's ending soonest (Urgency)
};





/* ---------------- START ATTEMPT SERVICE ---------------- */
export const startAttempt = async (student, testId) => {
    console.log("Starting attempt for student:", student.id || student._id, "Test ID:", testId);

    const test = await Test.findById(testId).lean();

    if (!test)
        throw new Error("Test not found");

    const studentId = new mongoose.Types.ObjectId(student.id || student._id);
    const testObjId = new mongoose.Types.ObjectId(testId);
    const studentBatchId = student.batchId?.toString();

    if (!test.batches.some(b => b.toString() === studentBatchId))
        throw new Error("Not allowed to attempt this test");

    const now = new Date();

    // ── START TIME CHECK ───────────────────────────────
    if (test.startTime && now < new Date(test.startTime))
        throw new Error("Test has not started yet");


    // ── RETURN ACTIVE ATTEMPT IF EXISTS (MOVED UP) ─────
    const activeAttempt = await TestAttempt.findOne({
        testId: testObjId,
        studentId,
        status: "started"
    });

    if (activeAttempt)
        return activeAttempt;
    // ───────────────────────────────────────────────────


    // ── CHECK COMPLETED ATTEMPT ────────────────────────
    const completedAttempt = await TestAttempt.findOne({
        testId: testObjId,
        studentId,
        status: "completed"
    }).sort({ attemptNumber: -1 });


    // During active window → only 1 attempt allowed
    if (test.endTime && now <= new Date(test.endTime)) {
        if (completedAttempt) {
            throw new Error(
                "You have already attempted this test. Re-attempt allowed after test window closes."
            );
        }
    }
    // ───────────────────────────────────────────────────


    const attemptNumber = completedAttempt ? completedAttempt.attemptNumber + 1 : 1;

    // ── ASSIGNED SET ───────────────────────────────────
    let assignedSet = null;

    if (test.metadata?.distribution === "4 Sets" && test.sets) {
        const setKeys = Array.from(test.sets.keys());
        assignedSet = setKeys[Math.floor(Math.random() * setKeys.length)];
    }

    const sourceBlocks = assignedSet
        ? test.sets.get(assignedSet)
        : test.blocks;
    // ───────────────────────────────────────────────────


    // ── SNAPSHOT BLOCKS ────────────────────────────────
    const attemptBlocks = sourceBlocks.map(block => ({
        blockName: block.blockName,
        duration: block.duration,
        score: 0,
        sections: block.sections.map(section => ({
            subjectName: section.subjectName,
            subject: section.subject,
            numQuestions: section.numQuestions,
            score: 0,
            correct: 0,
            wrong: 0,
            unattempted: section.numQuestions,
            questions: section.questions.map(q => ({
                questionId: q.questionId,
                questionText: q.questionText,
                questionImage: q.questionImage || null,
                options: q.options,
                correctAnswer: q.correctAnswer,
                chosenOption: -1,
                explanation: q.explanation
            }))
        }))
    }));

    const totalUnattempted = attemptBlocks.reduce(
        (sum, b) => sum + b.sections.reduce((s, sec) => s + sec.numQuestions, 0),
        0
    );
    // ───────────────────────────────────────────────────


    // ── ATOMIC UPSERT ──────────────────────────────────
    const attempt = await TestAttempt.findOneAndUpdate(
        {
            testId: testObjId,
            studentId,
            attemptNumber
        },
        {
            $setOnInsert: {
                testId: testObjId,
                studentId,
                attemptNumber,
                assignedSet,
                blocks: attemptBlocks,
                status: "started",
                totalScore: 0,
                totalCorrect: 0,
                totalWrong: 0,
                totalUnattempted,
                startedAt: new Date()
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    return attempt;
};

/* ---------------- SUBMIT TEST SERVICE ---------------- */
export const submitTest = async (student, testId, data) => {
    console.log("Submitting test for student:", student.id || student._id, "Test ID:", testId);
    const { answers = [], timeTaken = 0, isFinal } = data;

    const studentId = student.id || student._id;

    const attempt = await TestAttempt.findOne({
        testId,
        studentId,
        status: "started"
    });

    if (!attempt)
        throw new Error("Active attempt not found");


    const test = await Test.findById(testId).lean();


    /* convert answers array to map */

    const answerMap = new Map();

    answers.forEach(a =>
        answerMap.set(a.questionId, Number(a.selectedOption))
    );


    let totalScore = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;


    attempt.blocks.forEach(block => {

        block.score = 0;

        block.sections.forEach(section => {

            section.score = 0;
            section.correct = 0;
            section.wrong = 0;
            section.unattempted = 0;

            const subjectRule =
                test.markingScheme.subjectWise.find(
                    s => s.subjectId.toString() === section.subject.toString()
                ) || {

                    correctMarks: test.markingScheme.defaultCorrect,
                    negativeMarks: test.markingScheme.defaultNegative
                };


            section.questions.forEach(q => {

                const selected =
                    answerMap.has(q.questionId.toString())
                        ? answerMap.get(q.questionId.toString())
                        : -1;


                q.chosenOption = selected;


                if (selected === -1) {

                    section.unattempted++;
                    totalUnattempted++;

                }
                else if (selected === q.correctAnswer) {

                    section.correct++;
                    totalCorrect++;

                    section.score += subjectRule.correctMarks;
                    block.score += subjectRule.correctMarks;
                    totalScore += subjectRule.correctMarks;

                }
                else {

                    section.wrong++;
                    totalWrong++;

                    section.score -= subjectRule.negativeMarks;
                    block.score -= subjectRule.negativeMarks;
                    totalScore -= subjectRule.negativeMarks;

                }

            });

        });

    });


    attempt.totalScore = totalScore;
    attempt.totalCorrect = totalCorrect;
    attempt.totalWrong = totalWrong;
    attempt.totalUnattempted = totalUnattempted;

    if (isFinal) {
        attempt.status = "completed";
        attempt.submittedAt = new Date();
        attempt.timeTaken = timeTaken;
    }

    attempt.markModified("blocks");
    await attempt.save();


    /* leaderboard */
    if (isFinal && attempt.attemptNumber === 1) {
        await Leaderboard.findOneAndUpdate(
            { testId, studentId },
            { score: totalScore, timeTaken, batchId: student.batchId },
            { upsert: true }
        );
    }

    return {

        totalScore,
        totalCorrect,
        totalWrong,
        totalUnattempted

    };

};


// ... existing imports
import Resource from "../teacher/Resource.js";

/**
 * @desc    Fetch resources assigned to the student's batch
 * @param   {Object} jwtUser - The user object from the token
 */
export const getMyLibrary = async (jwtUser) => {
    // 1. Find the student to get their batch assignment
    const student = await User.findById(jwtUser.id);

    if (!student || !student.batchId) {
        throw new Error("Student not assigned to any batch. Access denied.");
    }

    // 2. Query Resources
    // We look for resources where the student's batchId exists in the batchIds array
    const resources = await Resource.find({
        batchIds: student.batchId
    })
        .select("title category subject fileUrl fileSize createdAt")
        .sort({ createdAt: -1 }); // Newest first

    // 3. Optional: Grouping logic (If you want the frontend to receive categorized data)
    const categorized = resources.reduce((acc, res) => {
        const cat = res.category; // "Notes", "PYQs", "Formulas"
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(res);
        return acc;
    }, {});


    return categorized;
};




export const getProfile = async (userId) => {
    const user = await User.findById(userId)
        .select("-password")
        .populate({
            path: "batchId",
            select: "name teachers",
            populate: {
                path: "teachers",
                select: "name" // Only grab teacher names
            }
        })
        .populate("instituteId", "name");

    if (!user) throw new Error("Record not found");

    return user;
};