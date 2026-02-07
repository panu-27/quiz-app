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

  // Invalid credentials (generic message)
  if (!user) {
    return {
      status: 403,
      success: false,
      message: "Invalid email or password",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return {
      status: 403,
      success: false,
      message: "Invalid email or password",
    };
  }

  // Approval check
  if (user.role === "STUDENT" && !user.approved) {
    return {
      status: 403,
      success: false,
      message: "Your account is pending approval from the institute.",
    };
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing in .env file");
    return {
      status: 500,
      success: false,
      message: "Server configuration error",
    };
  }

  // Payload
  const payload = {
    id: user._id,
    role: user.role,
    instituteId: user.instituteId,
  };

  if (user.role === "STUDENT" && user.batchId) {
    payload.batchId = user.batchId;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    status: 200,
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        batchId: user.batchId || null,
      },
    },
  };
};
