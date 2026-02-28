import { extractText } from "unpdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Step 1: Extract clean text using unpdf
 * Step 2: Send controlled text to Gemini
 */
export const extractQuestionsFromPDF = async (buffer, subject) => {
  /* ---------------- 1. UNPDF EXTRACTION ---------------- */
  const uint8Array = new Uint8Array(buffer);
  const { text } = await extractText(uint8Array, {
    mergePages: true,
    normalizeWhitespace: true,
  });

  if (!text || text.length < 100) {
    throw new Error("PDF text extraction failed or too short");
  }

  /* Trim huge PDFs to stay within token limits */
  const SAFE_TEXT = text.slice(0, 15000);

  /* ---------------- 2. GEMINI PROMPT ---------------- */
  const prompt = `
You are an exam question extractor specialized in academic and scientific content.

TASK:
Convert the given text into MCQ questions with full LaTeX support for mathematical and scientific notation.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text outside the JSON array
- Output must be an ARRAY

LATEX RULES (VERY IMPORTANT):
- Wrap ALL mathematical expressions, equations, formulas, and symbols in LaTeX delimiters
- Use $...$ for inline math (e.g. "Find the value of $x^2 + 3x - 4 = 0$")
- Use $$...$$ for display/block math (e.g. "$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$")
- Use LaTeX for: fractions (\\frac{}{}), exponents (^), subscripts (_), Greek letters (\\alpha, \\beta), square roots (\\sqrt{}), integrals (\\int), summations (\\sum), vectors (\\vec{}), chemical formulas, and all special symbols
- Plain English text must NOT be wrapped in LaTeX
- Example question: "What is the derivative of $f(x) = x^3 + 2x$?"
- Example option text: "$3x^2 + 2$"

SCHEMA:
[
  {
    "questionText": "string (use LaTeX for any math/science notation)",
    "options": [
      { "text": "string (use LaTeX for any math/science notation)", "isImageOption": false },
      { "text": "string (use LaTeX for any math/science notation)", "isImageOption": false },
      { "text": "string (use LaTeX for any math/science notation)", "isImageOption": false },
      { "text": "string (use LaTeX for any math/science notation)", "isImageOption": false }
    ],
    "correctAnswer": 0,
    "explanation": "string (use LaTeX for any math/science notation)"
  }
]

NOTE:
- "options" must be an array of exactly 4 option objects
- "correctAnswer" must be the index (0, 1, 2, or 3) of the correct option
- Every option object must have "text" (string) and "isImageOption": false

SUBJECT: ${subject}

TEXT:
${SAFE_TEXT}
`;

  /* ---------------- 3. GEMINI CALL ---------------- */
  // ✅ Fixed model name — gemini-3-flash-preview does not exist
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  /* ---------------- 4. JSON SAFETY PARSE ---------------- */
  try {
    // ✅ Strip markdown fences — Gemini wraps JSON in ```json``` even when told not to
    const clean = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini output is not an array");
    }

    // ✅ Sanitize each question — ensure options are plain strings
    const sanitized = parsed
      .filter(q => q.questionText && Array.isArray(q.options) && q.options.length >= 2)
      .map(q => ({
        questionText: q.questionText.trim(),
        options: q.options.map(opt => {
          // Handle both old plain-string format and new object format
          if (typeof opt === "string") {
            return { text: opt.trim(), isImageOption: false, image: null };
          }
          return {
            text: (opt.text || "").trim(),
            isImageOption: false,
            image: null,
          };
        }),
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        explanation: q.explanation || ""
      }));

    if (sanitized.length === 0) {
      throw new Error("No valid questions extracted from PDF");
    }

    return sanitized;

  } catch (err) {
    console.error("Gemini raw response:", responseText);
    throw new Error("Failed to parse Gemini response: " + err.message);
  }
};
