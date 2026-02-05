import { extractText } from "unpdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Step 1: Extract clean text using unpdf
 * Step 2: Send controlled text to Gemini
 */
export const extractQuestionsFromPDF = async (buffer, subject) => {
  /* ---------------- 1️⃣ UNPDF EXTRACTION ---------------- */
 const uint8Array = new Uint8Array(buffer);
const { text } = await extractText(uint8Array, {
  mergePages: true,
  normalizeWhitespace: true,
});


  if (!text || text.length < 100) {
    throw new Error("PDF text extraction failed or too short");
  }

  /* Optional safety: trim huge PDFs */
  const SAFE_TEXT = text.slice(0, 15000);

  /* ---------------- 2️⃣ GEMINI PROMPT ---------------- */
  const prompt = `
You are an exam question extractor.

TASK:
Convert the given text into MCQ questions.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Output must be an ARRAY

SCHEMA:
[
  {
    "questionText": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "string"
  }
]

SUBJECT: ${subject}

TEXT:
${SAFE_TEXT}
`;

  /* ---------------- 3️⃣ GEMINI CALL ---------------- */
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  /* ---------------- 4️⃣ JSON SAFETY PARSE ---------------- */
  try {
    const parsed = JSON.parse(responseText);

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini output is not an array");
    }

    return parsed;
  } catch (err) {
    console.error("Gemini raw response:", responseText);
    throw new Error("Failed to parse Gemini response");
  }
};
