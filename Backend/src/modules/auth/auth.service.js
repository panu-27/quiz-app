import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import Institute from "../institute/institute.model.js";

export const registerStudent = async ({ name, email, password, instituteId }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already registered");

  const institute = await Institute.findById(instituteId);
  if (!institute) throw new Error("Invalid institute");

  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "STUDENT",
    instituteId,
    approved: false,
  });

  return student;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  // Security Tip: Keep error messages vague to prevent email harvesting
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  // Approval Check
  if (user.role === "STUDENT" && !user.approved) {
    // This matches the "pending" status we discussed for the UI
    throw new Error("Your account is pending approval from the institute.");
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing in .env file");
    throw new Error("Server configuration error");
  }

  // Create Payload
  const payload = {
    id: user._id,
    role: user.role,
    instituteId: user.instituteId,
  };

  // Only add batchId if it actually exists
  if (user.role === "STUDENT" && user.batchId) {
    payload.batchId = user.batchId;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instituteId: user.instituteId,
      batchId: user.batchId || null, // Ensure consistent structure
    },
  };
};