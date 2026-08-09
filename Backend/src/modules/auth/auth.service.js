import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import Institute from "../institute/institute.model.js";
import Batch from "../batch/batch.model.js";

export const registerStudent = async ({ name, email, password, instituteId, className }) => {
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

  const selectedClass = className || "MHT CET";

  // Default assignments: class: chosen, batch: FREE
  
  let freeBatch = await Batch.findOne({ instituteId, className: selectedClass, name: "FREE" });
  if (!freeBatch) {
    // Need to assign teachers to this new batch so they can see it
    const teachers = await User.find({ 
      instituteId, 
      role: { $in: ["TEACHER", "INSTITUTE_ADMIN", "ADMIN"] } 
    }).select("_id");
    
    freeBatch = await Batch.create({
      name: "FREE",
      className: selectedClass,
      instituteId,
      teachers: teachers.map((t) => t._id),
      students: [student._id],
    });
  } else {
    if (!freeBatch.students.includes(student._id)) {
      freeBatch.students.push(student._id);
      await freeBatch.save();
    }
  }

  // Update student batchId
  student.batchId = freeBatch._id;
  await student.save();

  return student;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate("batchId");

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
    approved: user.approved,
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
        batchId: user.batchId?._id || user.batchId || null,
        className: user.batchId?.className || null,
        profilePic : user.profilePic || null,
        approved: user.approved,
      },
    },
  };
};


