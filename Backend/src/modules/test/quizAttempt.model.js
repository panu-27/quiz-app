import mongoose from "mongoose";


/* ---------------- ATTEMPT QUESTION ---------------- */
const attemptQuestionSchema = new mongoose.Schema({

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  questionText: String,
  questionImage : {
    type:String ,
    default:null 
  } ,
  options: [{
    text: {
      type : String ,
      default : null 
    },
    image: {
      type: String,
      default: null
    },
  }],

  correctAnswer: {
    type: Number,
    required: true
  },

  // only store student's choice
  chosenOption: {
    type: Number,
    default: -1
  },

  explanation: String,

  timeTakenSeconds: {
    type: Number,
    default: 0
  }

}, { _id: false });



/* ---------------- ATTEMPT SECTION ---------------- */
const attemptSectionSchema = new mongoose.Schema({

  subjectName: String,

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },

  numQuestions: Number,

  questions: {
    type: [attemptQuestionSchema],
    default: []
  },

  /* ✅ SECTION-LEVEL RESULT (THIS IS WHAT YOU WANT) */

  score: {
    type: Number,
    default: 0
  },

  correct: {
    type: Number,
    default: 0
  },

  wrong: {
    type: Number,
    default: 0
  },

  unattempted: {
    type: Number,
    default: 0
  }

}, { _id: false });



/* ---------------- ATTEMPT BLOCK ---------------- */
const attemptBlockSchema = new mongoose.Schema({

  blockName: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    required: true
  },

  sections: {
    type: [attemptSectionSchema],
    default: []
  },

  /* OPTIONAL: block-level score */
  score: {
    type: Number,
    default: 0
  }

}, { _id: false });



/* ---------------- TEST ATTEMPT ---------------- */
const testAttemptSchema = new mongoose.Schema({

  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test" // no longer required, since PYQ practice won't have one
  },

  attemptType: {
    type: String,
    enum: ["test", "practice"],
    default: "test"
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  attemptNumber: {
    type: Number,
    default: 1
  },

  customTitle: {
    type: String,
    default: "Practice Quiz"
  },

  isPinned: {
    type: Boolean,
    default: false
  },

  parentAttemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizAttempt",
    default: null
  },

  assignedSet: {
    type: String,
    enum: ["A", "B", "C", "D"]
  },


  /* EXACT SNAPSHOT OF TEST STRUCTURE */
  blocks: {
    type: [attemptBlockSchema],
    default: []
  },


  status: {
    type: String,
    enum: ["started", "completed"],
    default: "started"
  },


  /* OVERALL RESULT */
  totalScore: {
    type: Number,
    default: 0
  },

  totalCorrect: {
    type: Number,
    default: 0
  },

  totalWrong: {
    type: Number,
    default: 0
  },

  totalUnattempted: {
    type: Number,
    default: 0
  },


  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: Date,

  timeTaken: Number

}, { timestamps: true });



// Removed unique index to allow multiple practice attempts without testId


export default mongoose.model("QuizAttempt", testAttemptSchema);