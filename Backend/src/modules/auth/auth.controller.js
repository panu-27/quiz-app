import * as authService from "./auth.service.js";

export const registerStudent = async (req, res) => {
  try {
    const student = await authService.registerStudent(req.body);
    res.status(201).json({
      message: "Registration successful. Wait for approval.",
      studentId: student._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};