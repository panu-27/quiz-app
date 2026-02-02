import * as service from "./super.service.js";

export const createInstitute = async (req, res) => {
  try {
    const institute = await service.createInstitute(req.user, req.body);
    res.status(201).json(institute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createInstituteAdmin = async (req, res) => {
  try {
    const admin = await service.createInstituteAdmin(req.user, req.body);
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInstitutes = async (req, res) => {
  console.log("api hit")
  try {
    const institutes = await service.getInstitutes();
    res.json(institutes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getInstituteAdmins = async (req, res) => {
  try {
    const admins = await service.getInstituteAdmins(req.params.instituteId);
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    await service.deleteInstitute(req.params.id);
    res.json({ message: "Institute deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    await service.deleteAdmin(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getAllAdmins = async (req, res) => {
  try {
    const admins = await service.getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
