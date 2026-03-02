import * as authService from "./auth.service.js";
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";// adjust path if needed

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
  
    const result = await authService.login(req.body);
    return res.status(result.status).json(result);
  
};




export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    // Log the request to debug incoming data
    const { oldPassword, newPassword } = req.body;


    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Verify the old password matches the one in DB
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Current password (old) is incorrect" });
    }

    // 2. Hash and Save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};