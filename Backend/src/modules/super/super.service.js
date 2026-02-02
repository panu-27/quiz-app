import bcrypt from "bcryptjs";
import Institute from "../institute/institute.model.js";
import User from "../user/user.model.js";

export const createInstitute = async (superAdmin, { name, code }) => {
  const exists = await Institute.findOne({ code });
  if (exists) throw new Error("Institute code already exists");

  return Institute.create({
    name,
    code,
    createdBy: superAdmin.id,
  });
};

export const createInstituteAdmin = async (
  superAdmin,
  { name, email, password, instituteId }
) => {
  const institute = await Institute.findById(instituteId);
  if (!institute) throw new Error("Institute not found");

  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    password: hashed,
    role: "INSTITUTE_ADMIN",
    instituteId,
    approved: true,
  });

  institute.admins.push(admin._id);
  await institute.save();

  return admin;
};

export const getInstitutes = async () => {
  return Institute.find().select("_id name code createdAt");
};


// Get all admins for a specific institute
export const getInstituteAdmins = async (instituteId) => {
  return User.find({ instituteId, role: "INSTITUTE_ADMIN" })
             .select("-password"); // Never return passwords
};

// Delete an institute and handle cleanup
export const deleteInstitute = async (id) => {
  const institute = await Institute.findByIdAndDelete(id);
  if (!institute) throw new Error("Institute not found");
  
  // Optional: Delete all users associated with this institute
  await User.deleteMany({ instituteId: id });
  return institute;
};

// Delete a specific admin
export const deleteAdmin = async (adminId) => {
  const admin = await User.findByIdAndDelete(adminId);
  if (!admin) throw new Error("Admin not found");

  // Remove reference from the Institute document
  await Institute.updateOne(
    { _id: admin.instituteId },
    { $pull: { admins: adminId } }
  );
  return admin;
};


export const getAllAdmins = async () => {
  return User.find({ role: "INSTITUTE_ADMIN" })
    .populate("instituteId", "name code") // This shows which institute they belong to
    .select("-password");
};