import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";
import Leaderboard from "../test/leaderboard.model.js";
import Resource from "../teacher/Resource.js";   // ← moved to top (was mid-file, breaking ESM)
import mongoose from "mongoose";
import Batch from "../batch/batch.model.js";


/* ---------------- GET MY TESTS ---------------- */
export const getMyTests = async (jwtUser) => {
    const userId = jwtUser.id || jwtUser._id;
    const student = await User.findById(userId);

    if (!student || !student.batchId) {
        console.warn(`Student ${userId} has no batch assigned.`);
        return [];
    }

    let targetBatchIds = [student.batchId];
    const studentBatch = await Batch.findById(student.batchId).lean();
    
    if (studentBatch && /FREE/i.test(studentBatch.name)) {
        const siblingBatches = await Batch.find({
            instituteId: studentBatch.instituteId,
            className: studentBatch.className
        }).select('_id').lean();
        targetBatchIds = siblingBatches.map(b => b._id);
    }

    const now = new Date();

    const rawTests = await Test.find({
        batches: { $in: targetBatchIds },
        startTime: { $lte: now },
        $or: [{ endTime: { $gte: now } }, { endTime: null }]
    })
        .select("_id title startTime endTime mode duration examType blocks teacherId")
        .populate("teacherId", "name")
        .sort({ endTime: 1 })
        .lean();

    // Calculate totalQuestions from blocks -> sections -> questions
    return rawTests.map(t => {
        let totalQuestions = 0;
        if (Array.isArray(t.blocks)) {
            for (const block of t.blocks) {
                if (Array.isArray(block.sections)) {
                    for (const section of block.sections) {
                        totalQuestions += Array.isArray(section.questions)
                            ? section.questions.length
                            : (section.numQuestions || 0);
                    }
                }
            }
        }
        const { blocks, teacherId, ...rest } = t;
        const teacherName = teacherId?.name || null;
        return { ...rest, totalQuestions, teacherName };
    });
};


/* ---------------- UPDATE PROFILE PIC ---------------- */
export const updateProfilePic = async (userId, imageUrl) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { profilePic: imageUrl },
        { new: true }
    ).select("profilePic");

    if (!user) throw new Error("User not found");
    return user;
};

/* ---------------- GET ACTIVE CLASSES ---------------- */
export const getActiveClasses = async (jwtUser) => {
    // If jwtUser doesn't have instituteId directly, get it from the user document
    let instituteId = jwtUser.instituteId;
    if (!instituteId) {
        const user = await User.findById(jwtUser.id || jwtUser._id).select("instituteId").lean();
        instituteId = user?.instituteId;
    }
    if (!instituteId) return [];
    
    const batches = await Batch.find({ instituteId }).select('className').lean();
    const classNames = [...new Set(batches.map(b => b.className).filter(Boolean))];
    return classNames;
};

/* ---------------- CHANGE CLASS ---------------- */
export const changeClass = async (userId, newClassName) => {
    const student = await User.findById(userId);
    if (!student) throw new Error("Student not found");
    
    if (student.approved) {
        throw new Error("Approved students cannot change class directly. Please contact administrator.");
    }
    
    const freeBatch = await Batch.findOne({
        instituteId: student.instituteId,
        className: newClassName,
        name: { $regex: /FREE/i }
    });
    
    if (!freeBatch) {
        throw new Error(`FREE batch not found for class ${newClassName}`);
    }
    
    student.batchId = freeBatch._id;
    await student.save();
    
    return student;
};

/* ---------------- START ATTEMPT ---------------- */
export const startAttempt = async (student, testId) => {
    const test = await Test.findById(testId).lean();
    if (!test) throw new Error("Test not found");

    const studentId    = new mongoose.Types.ObjectId(student.id || student._id);
    const testObjId    = new mongoose.Types.ObjectId(testId);
    
    const dbStudent = await User.findById(studentId).lean();
    if (!dbStudent || !dbStudent.batchId) throw new Error("Student has no batch assigned");

    const actualBatchId = dbStudent.batchId.toString();
    let allowedBatchIds = [actualBatchId];
    
    const studentBatch = await Batch.findById(actualBatchId).lean();
    if (studentBatch && /FREE/i.test(studentBatch.name)) {
        const siblingBatches = await Batch.find({
            instituteId: studentBatch.instituteId,
            className: studentBatch.className
        }).select('_id').lean();
        allowedBatchIds = siblingBatches.map(b => b._id.toString());
    }

    if (!test.batches.some(b => allowedBatchIds.includes(b.toString())))
        throw new Error("Not allowed to attempt this test");

    const now = new Date();

    if (test.startTime && now < new Date(test.startTime))
        throw new Error("Test has not started yet");

    const activeAttempt = await TestAttempt.findOne({
        testId: testObjId, studentId, status: "started"
    });
    if (activeAttempt) return activeAttempt;

    const completedAttempt = await TestAttempt.findOne({
        testId: testObjId, studentId, status: "completed"
    }).sort({ attemptNumber: -1 });

    if (test.endTime && now <= new Date(test.endTime)) {
        if (completedAttempt)
            throw new Error("You have already attempted this test. Re-attempt allowed after test window closes.");
    }

    const attemptNumber = completedAttempt ? completedAttempt.attemptNumber + 1 : 1;

    let assignedSet = null;
    if (test.metadata?.distribution === "4 Sets" && test.sets) {
        const setKeys = Array.from(test.sets.keys());
        assignedSet = setKeys[Math.floor(Math.random() * setKeys.length)];
    }

    const sourceBlocks = assignedSet ? test.sets.get(assignedSet) : test.blocks;

    const shuffleArray = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const attemptBlocks = sourceBlocks.map(block => ({
        blockName: block.blockName,
        duration:  block.duration,
        score:     0,
        sections:  block.sections.map(section => ({
            subjectName:  section.subjectName,
            subject:      section.subject,
            numQuestions: section.numQuestions,
            score:        0,
            correct:      0,
            wrong:        0,
            unattempted:  section.numQuestions,
            questions:    shuffleArray(section.questions).map(q => ({
                questionId:   q.questionId,
                questionText: q.questionText,
                questionImage: q.questionImage || null,
                options:      q.options,
                correctAnswer: q.correctAnswer,
                chosenOption: -1,
                explanation:  q.explanation
            }))
        }))
    }));

    const totalUnattempted = attemptBlocks.reduce(
        (sum, b) => sum + b.sections.reduce((s, sec) => s + sec.numQuestions, 0), 0
    );

    const attempt = await TestAttempt.findOneAndUpdate(
        { testId: testObjId, studentId, attemptNumber },
        {
            $setOnInsert: {
                testId: testObjId, studentId, attemptNumber,
                assignedSet, blocks: attemptBlocks,
                status: "started", totalScore: 0,
                totalCorrect: 0, totalWrong: 0,
                totalUnattempted, startedAt: new Date()
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return attempt;
};


/* ---------------- SUBMIT TEST ---------------- */
export const submitTest = async (student, testId, data) => {
    const { answers = [], timeTaken = 0, isFinal } = data;
    const studentId = student.id || student._id;

    const attempt = await TestAttempt.findOne({ testId, studentId, status: "started" });
    if (!attempt) throw new Error("Active attempt not found");

    const test = await Test.findById(testId).lean();
    const answerMap = new Map();
    answers.forEach(a => answerMap.set(a.questionId, Number(a.selectedOption)));

    let totalScore = 0, totalCorrect = 0, totalWrong = 0, totalUnattempted = 0;

    attempt.blocks.forEach(block => {
        block.score = 0;
        block.sections.forEach(section => {
            section.score = 0; section.correct = 0; section.wrong = 0; section.unattempted = 0;

            const subjectRule = test.markingScheme.subjectWise.find(
                s => s.subjectId.toString() === section.subject.toString()
            ) || {
                correctMarks:  test.markingScheme.defaultCorrect,
                negativeMarks: test.markingScheme.defaultNegative
            };

            section.questions.forEach(q => {
                const selected = answerMap.has(q.questionId.toString())
                    ? answerMap.get(q.questionId.toString()) : -1;
                q.chosenOption = selected;

                if (selected === -1) {
                    section.unattempted++; totalUnattempted++;
                } else if (selected === q.correctAnswer) {
                    section.correct++; totalCorrect++;
                    section.score += subjectRule.correctMarks;
                    block.score   += subjectRule.correctMarks;
                    totalScore    += subjectRule.correctMarks;
                } else {
                    section.wrong++; totalWrong++;
                    section.score -= subjectRule.negativeMarks;
                    block.score   -= subjectRule.negativeMarks;
                    totalScore    -= subjectRule.negativeMarks;
                }
            });
        });
    });

    attempt.totalScore       = totalScore;
    attempt.totalCorrect     = totalCorrect;
    attempt.totalWrong       = totalWrong;
    attempt.totalUnattempted = totalUnattempted;

    if (isFinal) {
        attempt.status      = "completed";
        attempt.submittedAt = new Date();
        attempt.timeTaken   = timeTaken;
    }

    attempt.markModified("blocks");
    await attempt.save();

    if (isFinal && attempt.attemptNumber === 1) {
        await Leaderboard.findOneAndUpdate(
            { testId, studentId },
            { score: totalScore, timeTaken, batchId: student.batchId },
            { upsert: true }
        );
    }

    return { totalScore, totalCorrect, totalWrong, totalUnattempted };
};


/* ---------------- GET MY LIBRARY ---------------- */
/**
 * GET /student/my-library
 * Query params (all optional):
 *   subjectId  — "phy" | "che" | "mat" | "bio"
 *   chapterId  — "phy-01" … "bio-13"
 *   category   — "notes" | "pyqs" | "boards" | "formulas" | etc.
 *
 * With params  → returns flat array  (mobile drill-down)
 * Without params → returns grouped object by category  (desktop legacy)
 */
export const getMyLibrary = async (jwtUser, queryParams = {}) => {
    const student = await User.findById(jwtUser.id);

    if (!student || !student.batchId) {
        console.warn(`Student ${jwtUser.id} has no batch assigned.`);
        return (queryParams.subjectId || queryParams.chapterId || queryParams.category) ? [] : {};
    }

    const { subjectId, chapterId, category } = queryParams;

    // Build filter — always scope to student's batch
    const filter = { batchIds: student.batchId };
    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;
    if (category)  filter.category  = category;

    const resources = await Resource.find(filter)
        .select("title subjectId chapterId category subject fileUrl fileSize createdAt")
        .sort({ createdAt: -1 });

    // Mobile drill-down → flat array
    if (subjectId || chapterId || category) {
        return resources;
    }

    // Desktop legacy → grouped by category
    const categorized = resources.reduce((acc, res) => {
        const cat = res.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(res);
        return acc;
    }, {});

    return categorized;
};


/* ---------------- GET PROFILE ---------------- */
export const getProfile = async (userId) => {
    const user = await User.findById(userId)
        .select("-password")
        .populate({
            path: "batchId",
            select: "name teachers",
            populate: { path: "teachers", select: "name" }
        })
        .populate("instituteId", "name");

    if (!user) throw new Error("Record not found");
    return user;
};


/* ---------------- GET ALL TESTS WITH ATTEMPTS ---------------- */
export const getAllTestsWithAttempts = async (jwtUser) => {
    const userId = jwtUser.id || jwtUser._id;
    const student = await User.findById(userId);

    if (!student || !student.batchId) {
        console.warn(`Student ${userId} has no batch assigned.`);
        return [];
    }

    let targetBatchIds = [student.batchId];
    const studentBatch = await Batch.findById(student.batchId).lean();
    
    if (studentBatch && /FREE/i.test(studentBatch.name)) {
        const siblingBatches = await Batch.find({
            instituteId: studentBatch.instituteId,
            className: studentBatch.className
        }).select('_id').lean();
        targetBatchIds = siblingBatches.map(b => b._id);
    }

    const tests = await Test.find({ batches: { $in: targetBatchIds } })
        .populate("teacherId", "name")
        .lean();

    const attempts = await TestAttempt.find({ studentId: userId, status: "completed" })
        .select("_id testId attemptNumber totalScore totalCorrect totalWrong submittedAt createdAt")
        .sort({ attemptNumber: -1 })
        .lean();

    // Group attempts by testId
    const attemptsMap = {};
    attempts.forEach(att => {
        const tId = att.testId.toString();
        if (!attemptsMap[tId]) {
            attemptsMap[tId] = [];
        }
        attemptsMap[tId].push(att);
    });

    // Map tests and calculate totalQuestions
    return tests.map(test => {
        let totalQuestions = 0;
        if (test.blocks) {
            test.blocks.forEach(b => {
                if (b.sections) {
                    b.sections.forEach(s => {
                        totalQuestions += s.numQuestions || 0;
                    });
                }
            });
        }

        return {
            _id: test._id,
            title: test.title,
            startTime: test.startTime,
            endTime: test.endTime,
            mode: test.mode,
            duration: test.duration,
            examType: test.examType,
            totalQuestions,
            teacherName: test.teacherId?.name || "Educator",
            attempts: attemptsMap[test._id.toString()] || []
        };
    });
};