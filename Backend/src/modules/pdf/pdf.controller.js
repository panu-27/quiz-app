import { extractQuestionsFromPDF } from "./pdf.service.js";

export const extractPDF = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("PDF file is required");
    }

    const { subject } = req.body;
    if (!subject) {
      throw new Error("Subject is required");
    }

    const questions = await extractQuestionsFromPDF(
      req.file.buffer,
      subject
    );

    res.json({ questions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
