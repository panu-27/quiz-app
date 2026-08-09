import { extractQuestionsFromPDF, generatePuppeteerPDF, generateAnalysisPuppeteerPDF } from "./pdf.service.js";
import User from "../user/user.model.js";
import Institute from "../institute/institute.model.js";

export const extractPDF = async (req, res) => {
  try {
    if (!req.file) throw new Error("PDF file is required");
    const { subject } = req.body;
    if (!subject) throw new Error("Subject is required");
    const questions = await extractQuestionsFromPDF(req.file.buffer, subject);
    res.json({ questions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const downloadPDF = async (req, res) => {
  try {
    const {
      subLabel, activeChapters, selectedTopics,
      topicQuestions, yearFrom, yearTo, docType,
    } = req.body;

    if (!topicQuestions || typeof topicQuestions !== "object")
      throw new Error("topicQuestions object is required");
    if (!subLabel) throw new Error("subLabel is required");

    /* Resolve institute name from the authenticated user */
    let instituteName = "Nexus";
    console.log("Authenticated user ID:", req.user.id); // check if user ID is present
    try {
      const user = await User.findById(req.user.id).lean();
      if (user?.instituteId) {
        const institute = await Institute.findById(user.instituteId).lean();
        console.log("Resolved institute:", institute);
        if (institute?.name) instituteName = institute.name;
      }
    } catch { 
      console.log("Could not resolve institute for user:", req.user._id);
     }

    const pdfBuffer = await generatePuppeteerPDF({
      subLabel,
      activeChapters:  activeChapters  || [],
      selectedTopics:  selectedTopics  || [],
      topicQuestions,
      yearFrom:        yearFrom        || 2010,
      yearTo:          yearTo          || 2024,
      docType:         docType         || "QUESTION PAPER",
      instituteName,
    });

    const safe = subLabel.replace(/[^a-zA-Z0-9]/g, "_");
    const inst = instituteName.replace(/\s+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${inst}_PYQ_${safe}_${yearFrom}-${yearTo}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("downloadPDF error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const downloadAnalysisPDF = async (req, res) => {
  try {
    const { title, stats, groupedAnalysis } = req.body;

    if (!groupedAnalysis || !Array.isArray(groupedAnalysis))
      throw new Error("groupedAnalysis array is required");

    let instituteName = "Nexus";
    try {
      const user = await User.findById(req.user.id).lean();
      if (user?.instituteId) {
        const institute = await Institute.findById(user.instituteId).lean();
        if (institute?.name) instituteName = institute.name;
      }
    } catch (e) {
      console.log("Could not resolve institute for user in analysis PDF", e);
    }

    const pdfBuffer = await generateAnalysisPuppeteerPDF({
      title: title || "Test Analysis",
      instituteName,
      stats: stats || { score: 0, maxScore: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 },
      groupedAnalysis
    });

    const safe = (title || "Analysis").replace(/[^a-zA-Z0-9]/g, "_");
    const inst = instituteName.replace(/\s+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${inst}_${safe}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("downloadAnalysisPDF error:", err);
    res.status(400).json({ message: err.message });
  }
};