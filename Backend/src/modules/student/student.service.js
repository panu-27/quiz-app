import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";
import Leaderboard from "../test/leaderboard.model.js";
import Resource from "../teacher/Resource.js";   // ← moved to top (was mid-file, breaking ESM)
import mongoose from "mongoose";
import Batch from "../batch/batch.model.js";
import Syllabus from "../institute/syllabus.model.js";


/* ---------------- GET MY TESTS ---------------- */
export const getMyTests = async (jwtUser) => {
    const userId = jwtUser.id || jwtUser._id;
    const student = await User.findById(userId);

    if (!student) {
        return [];
    }

    const instituteId = student.instituteId || jwtUser.instituteId;
    let targetBatchIds = student.batchId ? [student.batchId] : [];
    
    try {
        const allInstituteBatches = await Batch.find(instituteId ? { instituteId } : {}).select('_id').lean();
        allInstituteBatches.forEach(b => {
            if (!targetBatchIds.some(id => id.toString() === b._id.toString())) {
                targetBatchIds.push(b._id);
            }
        });
    } catch (e) {
        console.warn("Error fetching all batches for tests:", e);
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
    let instituteId = jwtUser.instituteId;
    if (!instituteId) {
        const user = await User.findById(jwtUser.id || jwtUser._id).select("instituteId batchId").lean();
        instituteId = user?.instituteId;
        if (!instituteId && user?.batchId) {
            const batch = await Batch.findById(user.batchId).select("instituteId").lean();
            instituteId = batch?.instituteId;
        }
    }
    if (!instituteId) return [];
    
    const batches = await Batch.find({ instituteId }).select('className').lean();
    const syllabuses = await Syllabus.find({ instituteId }).select('className').lean();
    const classNames = [...new Set([
        ...batches.map(b => b.className).filter(Boolean),
        ...syllabuses.map(s => s.className).filter(Boolean)
    ])];
    return classNames;
};

/* ---------------- CHANGE CLASS ---------------- */
export const changeClass = async (userId, newClassName) => {
    const student = await User.findById(userId);
    if (!student) throw new Error("Student not found");
    
    if (student.approved) {
        return {
            student,
            className: newClassName,
            message: "Goal updated locally for approved student"
        };
    }

    if (!newClassName) throw new Error("New class name is required");

    let instituteId = student.instituteId;
    if (!instituteId && student.batchId) {
        const currentBatch = await Batch.findById(student.batchId).lean();
        instituteId = currentBatch?.instituteId;
    }

    if (!instituteId) {
        throw new Error("Student has no assigned institute");
    }

    // Check if the requested class matches an existing active class in the institute
    const activeClasses = await getActiveClasses({ instituteId, id: userId });
    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normRequested = normalize(newClassName);
    const matchedClass = activeClasses.find(ac => normalize(ac) === normRequested);

    if (matchedClass) {
        newClassName = matchedClass;
    }

    // Try finding existing FREE batch with exact or flexible matching
    const flexible = newClassName.replace(/[\s_-]+/g, '[\\s_-]+');

    let freeBatch = await Batch.findOne({
        instituteId,
        className: newClassName,
        name: { $regex: /FREE/i }
    });

    if (!freeBatch) {
        freeBatch = await Batch.findOne({
            instituteId,
            className: { $regex: new RegExp(`^${flexible}$`, "i") },
            name: { $regex: /FREE/i }
        });
    }

    // If still not found, check if a Syllabus exists for this class (or flexible name)
    let finalClassName = newClassName;
    if (!freeBatch) {
        const matchingSyllabus = await Syllabus.findOne({
            instituteId,
            className: { $regex: new RegExp(`^${flexible}$`, "i") }
        }).lean();
        if (matchingSyllabus) {
            finalClassName = matchingSyllabus.className;
            freeBatch = await Batch.findOne({
                instituteId,
                className: finalClassName,
                name: { $regex: /FREE/i }
            });
        }
    }

    // If still no FREE batch exists, automatically create one so students can always join
    if (!freeBatch) {
        const teachers = await User.find({
            instituteId,
            role: { $in: ["TEACHER", "INSTITUTE_ADMIN", "ADMIN"] }
        }).select("_id");

        freeBatch = await Batch.create({
            name: "FREE",
            className: finalClassName,
            instituteId,
            teachers: teachers.map(t => t._id),
            students: [student._id]
        });
    } else {
        if (!freeBatch.students.some(sId => sId.toString() === student._id.toString())) {
            freeBatch.students.push(student._id);
            await freeBatch.save();
        }
    }

    // Remove from previous batch if different
    if (student.batchId && student.batchId.toString() !== freeBatch._id.toString()) {
        await Batch.updateOne(
            { _id: student.batchId },
            { $pull: { students: student._id } }
        );
    }

    student.batchId = freeBatch._id;
    if (!student.instituteId && instituteId) {
        student.instituteId = instituteId;
    }
    await student.save();

    return {
        student,
        batch: freeBatch,
        className: freeBatch.className
    };
};

/* ---------------- START ATTEMPT ---------------- */
export const startAttempt = async (student, testId) => {
    const test = await Test.findById(testId).lean();
    if (!test) throw new Error("Test not found");

    const studentId    = new mongoose.Types.ObjectId(student.id || student._id);
    const testObjId    = new mongoose.Types.ObjectId(testId);
    
    const dbStudent = await User.findById(studentId).lean();
    if (!dbStudent) throw new Error("Student not found");

    const instituteId = dbStudent.instituteId || student.instituteId;
    const actualBatchId = dbStudent.batchId ? dbStudent.batchId.toString() : null;
    let allowedBatchIds = actualBatchId ? [actualBatchId] : [];
    
    try {
        const allInstituteBatches = await Batch.find(instituteId ? { instituteId } : {}).select('_id').lean();
        allInstituteBatches.forEach(b => {
            const idStr = b._id.toString();
            if (!allowedBatchIds.includes(idStr)) {
                allowedBatchIds.push(idStr);
            }
        });
    } catch (e) {
        console.warn("Error fetching batches for attempt:", e);
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
    const student = await User.findById(jwtUser.id || jwtUser._id);

    const instituteId = student?.instituteId || jwtUser?.instituteId;
    let allowedBatchIds = [];
    try {
        const allInstituteBatches = await Batch.find(instituteId ? { instituteId } : {}).select('_id').lean();
        allowedBatchIds = allInstituteBatches.map(b => b._id);
    } catch (e) {
        console.warn("Error fetching all batches for library:", e);
    }

    const { subjectId, chapterId, category } = queryParams;

    // All students get access across all batches (plus free and unassigned resources)
    const batchConditions = [
        { isFree: true },
        ...(allowedBatchIds.length > 0 ? [{ batchIds: { $in: allowedBatchIds } }] : []),
        { batchIds: { $exists: false } },
        { batchIds: { $size: 0 } },
    ];

    const filter = { $or: batchConditions };

    if (subjectId && subjectId !== "All") {
        const subjectMap = {
            phy: "Physics",
            che: "Chemistry",
            mat: "Maths",
            bio: "Biology",
            physics: "Physics",
            chemistry: "Chemistry",
            maths: "Maths",
            mathematics: "Maths",
            biology: "Biology"
        };
        const cleanSubj = subjectId.trim();
        const mappedSubj = subjectMap[cleanSubj.toLowerCase()] || cleanSubj;
        const escapedSubj = cleanSubj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedMapped = mappedSubj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        filter.$and = filter.$and || [];
        filter.$and.push({
            $or: [
                { subjectId: { $regex: new RegExp(`^${escapedSubj}$`, "i") } },
                { subjectId: { $regex: new RegExp(`^${escapedMapped}$`, "i") } },
                { subject: { $regex: new RegExp(`^${escapedSubj}$`, "i") } },
                { subject: { $regex: new RegExp(`^${escapedMapped}$`, "i") } },
            ]
        });
    }

    if (chapterId && chapterId !== "All") {
        const cleanChapter = decodeURIComponent(chapterId).trim();
        const escapedChapter = cleanChapter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$and = filter.$and || [];
        filter.$and.push({
            $or: [
                { chapterId: { $regex: new RegExp(`^${escapedChapter}$`, "i") } },
                { chapter: { $regex: new RegExp(`^${escapedChapter}$`, "i") } }
            ]
        });
    }

    if (category && category !== "All") {
        filter.category = category.toLowerCase().trim();
    }

    const resources = await Resource.find(filter)
        .select("title subjectId chapterId category subject fileUrl fileSize isFree createdAt")
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


/* ---------------- GET MY SYLLABUS ---------------- */
export const getMySyllabus = async (jwtUser) => {
    const userId = jwtUser.id || jwtUser._id;
    const student = await User.findById(userId);

    if (!student) {
        return null;
    }

    let className = null;
    let instituteId = student.instituteId || jwtUser.instituteId;

    if (student.batchId) {
        const batch = await Batch.findById(student.batchId).lean();
        if (batch) {
            className = batch.className;
            if (!instituteId) instituteId = batch.instituteId;
        }
    }

    if (!className || !instituteId) {
        return null;
    }

    let syllabus = await Syllabus.findOne({
        instituteId,
        className,
    }).lean();

    if (!syllabus) {
        const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        syllabus = await Syllabus.findOne({
            instituteId,
            className: { $regex: new RegExp(`^${escaped}$`, "i") },
        }).lean();
    }

    if (!syllabus) {
        const flexibleName = className.replace(/[\s_-]+/g, '[\\s_-]+');
        syllabus = await Syllabus.findOne({
            instituteId,
            className: { $regex: new RegExp(`^${flexibleName}$`, "i") },
        }).lean();
    }

    return syllabus;
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