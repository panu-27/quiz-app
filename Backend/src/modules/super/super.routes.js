import express from "express";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";
import {
  createInstitute,
  createInstituteAdmin,
  getInstitutes,
  getInstituteAdmins, // New
  deleteInstitute,    // New
  deleteAdmin,
  getAllAdmins         // New
} from "./super.controller.js";

const router = express.Router();


router.get(
  "/get-institutes",
  getInstitutes
);

router.post(
  "/create-institute",
  auth,
  role(["SUPER_ADMIN"]),
  createInstitute
);

router.post(
  "/create-institute-admin",
  auth,
  role(["SUPER_ADMIN"]),
  createInstituteAdmin
);

router.get(
  "/institutes",
  auth,
  role(["SUPER_ADMIN"]),
  getInstitutes
);


// GET Admins for a specific institute
router.get("/institutes/:instituteId/admins", auth, role(["SUPER_ADMIN"]), getInstituteAdmins);
router.get("/all-admins", auth, role(["SUPER_ADMIN"]), getAllAdmins);
// DELETE Routes
router.delete("/institute/:id", auth, role(["SUPER_ADMIN"]), deleteInstitute);
router.delete("/admin/:id", auth, role(["SUPER_ADMIN"]), deleteAdmin);

export default router;
