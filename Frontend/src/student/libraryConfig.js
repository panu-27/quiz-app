// ─────────────────────────────────────────────────────────────────────────────
//  libraryConfig.js  —  Single source of truth for subjects + chapters
//  IDs are short slugs that get sent to the API as query params.
//  The DB stores these same IDs in the Resource document.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "notes",     label: "Notes",          icon: "📝", color: "#6366F1" },
  { id: "pyqs",      label: "PYQ's",          icon: "📋", color: "#F59E0B" },
  { id: "boards",    label: "Board Papers",   icon: "🏫", color: "#10B981" },
  { id: "formulas",  label: "Formulas",       icon: "⚡", color: "#3B82F6" },
  { id: "mindmaps",  label: "Mind Maps",      icon: "🧠", color: "#8B5CF6" },
  { id: "revision",  label: "Revision",       icon: "🔁", color: "#EC4899" },
];

export const SUBJECTS = [
  { id: "phy", label: "Physics",   color: "#3B82F6", bg: "#EFF6FF", emoji: "⚛️"  },
  { id: "che", label: "Chemistry", color: "#F59E0B", bg: "#FFFBEB", emoji: "🧪"  },
  { id: "mat", label: "Maths",     color: "#8B5CF6", bg: "#F5F3FF", emoji: "📐"  },
  { id: "bio", label: "Biology",   color: "#10B981", bg: "#ECFDF5", emoji: "🧬"  },
];

export const CHAPTERS = {
  phy: [
    { id: "phy-01", label: "Rotational Dynamics" },
    { id: "phy-02", label: "Mechanical Properties of Fluids" },
    { id: "phy-03", label: "Kinetic Theory of Gases & Radiation" },
    { id: "phy-04", label: "Thermodynamics" },
    { id: "phy-05", label: "Oscillations" },
    { id: "phy-06", label: "Superposition of Waves" },
    { id: "phy-07", label: "Wave Optics" },
    { id: "phy-08", label: "Electrostatics" },
    { id: "phy-09", label: "Current Electricity" },
    { id: "phy-10", label: "Magnetic Fields" },
    { id: "phy-11", label: "Electromagnetic Induction" },
    { id: "phy-12", label: "Electrons & Photons" },
    { id: "phy-13", label: "Atoms, Molecules & Nuclei" },
    { id: "phy-14", label: "Semiconductors" },
    { id: "phy-15", label: "Communication Systems" },
  ],
  che: [
    { id: "che-01", label: "Solid State" },
    { id: "che-02", label: "Solutions & Colligative Properties" },
    { id: "che-03", label: "Chemical Thermodynamics" },
    { id: "che-04", label: "Electrochemistry" },
    { id: "che-05", label: "Chemical Kinetics" },
    { id: "che-06", label: "p-Block Elements" },
    { id: "che-07", label: "d & f Block Elements" },
    { id: "che-08", label: "Coordination Compounds" },
    { id: "che-09", label: "Halogen Derivatives" },
    { id: "che-10", label: "Alcohols, Phenols & Ethers" },
    { id: "che-11", label: "Aldehydes & Ketones" },
    { id: "che-12", label: "Carboxylic Acids & Derivatives" },
    { id: "che-13", label: "Amines" },
    { id: "che-14", label: "Biomolecules" },
    { id: "che-15", label: "Polymers & Chemistry in Everyday Life" },
  ],
  mat: [
    { id: "mat-01", label: "Mathematical Logic" },
    { id: "mat-02", label: "Matrices" },
    { id: "mat-03", label: "Trigonometric Functions" },
    { id: "mat-04", label: "Pair of Straight Lines" },
    { id: "mat-05", label: "Vectors" },
    { id: "mat-06", label: "Line & Plane (3D)" },
    { id: "mat-07", label: "Linear Programming" },
    { id: "mat-08", label: "Continuity & Differentiability" },
    { id: "mat-09", label: "Applications of Derivatives" },
    { id: "mat-10", label: "Integration" },
    { id: "mat-11", label: "Definite Integrals & Applications" },
    { id: "mat-12", label: "Differential Equations" },
    { id: "mat-13", label: "Probability Distribution" },
    { id: "mat-14", label: "Binomial Distribution" },
  ],
  bio: [
    { id: "bio-01", label: "Reproduction in Plants" },
    { id: "bio-02", label: "Reproduction in Animals" },
    { id: "bio-03", label: "Inheritance & Variation" },
    { id: "bio-04", label: "Molecular Basis of Inheritance" },
    { id: "bio-05", label: "Origin & Evolution" },
    { id: "bio-06", label: "Human Health & Disease" },
    { id: "bio-07", label: "Animal Husbandry & Plant Breeding" },
    { id: "bio-08", label: "Microbes in Human Welfare" },
    { id: "bio-09", label: "Biotechnology" },
    { id: "bio-10", label: "Organisms & Populations" },
    { id: "bio-11", label: "Ecosystems" },
    { id: "bio-12", label: "Biodiversity & Conservation" },
    { id: "bio-13", label: "Environmental Issues" },
  ],
};