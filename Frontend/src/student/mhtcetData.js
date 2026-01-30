// mhtcetData.js
export const subjects = [
  { id: 'phy', name: 'Physics', accuracy: 72, icon: 'BoltIcon' },
  { id: 'chem', name: 'Chemistry', accuracy: 88, icon: 'BeakerIcon' },
  { id: 'math', name: 'Mathematics', accuracy: 45, icon: 'Square3Stack3DIcon' },
  { id: 'bio', name: 'Biology', accuracy: 91, icon: 'AcademicCapIcon' },
];

export const syllabusData = {
  "Physics": {
    "12th": [
      { name: "Rotational Dynamics", mastery: 42, status: "Critical", suggestion: "High Weightage (7%). Focus on Moment of Inertia of Ring/Disc and Banking of Roads. Practice 15 Level-2 PYQs." },
      { name: "Mechanical Properties of Fluids", mastery: 65, status: "Good", suggestion: "Mastered Surface Tension. Focus on Bernoulli's Theorem applications." },
      { name: "Thermodynamics", mastery: 95, status: "Excelled", suggestion: "Mastery achieved. You are solving Carnot Cycle problems 20% faster than average." },
      { name: "Oscillations", mastery: 72, status: "Good", suggestion: "Improve accuracy in 'Energy of Particle in SHM' and Phase diagrams." },
      { name: "Superposition of Waves", mastery: 38, status: "Critical", suggestion: "Frequent errors in Stationary Waves. Revise 'Nodes and Antinodes' concept." },
      { name: "Electrostatics", mastery: 50, status: "Good", suggestion: "Revise Gauss's Law and Capacitors in Series/Parallel." }
    ],
    "11th": [
      { name: "Motion in a Plane", mastery: 85, status: "Excelled", suggestion: "Solid base in Projectile Motion. Practice horizontal range variations." },
      { name: "Optics", mastery: 30, status: "Critical", suggestion: "Focus on Refraction through Prisms and Lens Maker's Formula." },
      { name: "Thermal Properties of Matter", mastery: 60, status: "Good", suggestion: "Improve speed in Calorimetry problems." }
    ]
  },
  "Chemistry": {
    "12th": [
      { name: "Solid State", mastery: 88, status: "Excelled", suggestion: "Great accuracy in Unit Cell calculations. Revise Point Defects." },
      { name: "Solutions", mastery: 45, status: "Critical", suggestion: "Struggling with Raoult's Law and Van't Hoff factor." },
      { name: "Ionic Equilibria", mastery: 62, status: "Good", suggestion: "Good on pH calculations. Practice Buffer Solutions." },
      { name: "Chemical Thermodynamics", mastery: 35, status: "Critical", suggestion: "Frequent errors in Enthalpy and Gibbs Energy signs." },
      { name: "Transition & Inner Transition", mastery: 92, status: "Excelled", suggestion: "Mastered d-block. Keep revising Lanthanoid Contraction." },
      { name: "Halogen Derivatives", mastery: 55, status: "Good", suggestion: "Focus on SN1 vs SN2 reaction mechanisms." }
    ],
    "11th": [
      { name: "Basic Concepts of Chemistry", mastery: 90, status: "Excelled", suggestion: "Mastered Stoichiometry. Move to advanced Redox reactions." },
      { name: "Structure of Atom", mastery: 48, status: "Critical", suggestion: "Focus on Quantum Numbers and Bohr’s Model energy levels." }
    ]
  },
  "Mathematics": {
    "12th": [
      { name: "Mathematical Logic", mastery: 98, status: "Excelled", suggestion: "Perfect accuracy. Move to the next chapter." },
      { name: "Matrices", mastery: 85, status: "Excelled", suggestion: "Strong on Adjoint and Inverse." },
      { name: "Trigonometric Functions", mastery: 40, status: "Critical", suggestion: "Struggling with General Solutions and Inverse Trig." },
      { name: "Differentiation", mastery: 75, status: "Good", suggestion: "Focus on Logarithmic differentiation." },
      { name: "Integration", mastery: 30, status: "Critical", suggestion: "Highest Weightage (10%). Focus on Integration by Parts immediately." },
      { name: "Probability Distribution", mastery: 82, status: "Excelled", suggestion: "Excellent understanding of Binomial Distribution." }
    ],
    "11th": [
      { name: "Trigonometry II", mastery: 50, status: "Good", suggestion: "Revise Compound Angle formulas." },
      { name: "Straight Lines", mastery: 68, status: "Good", suggestion: "Master the 'Distance of a point from a line' formula." }
    ]
  },
  "Biology": {
    "12th": [
      { name: "Reproduction in Plants", mastery: 85, status: "Excelled", suggestion: "Strong on Pollination. Revise Double Fertilization diagrams." },
      { name: "Inheritance and Variation", mastery: 35, status: "Critical", suggestion: "Struggling with Dihybrid Cross ratios." },
      { name: "Respiration and Circulation", mastery: 72, status: "Good", suggestion: "Focus on Transport of CO2 and O2 in blood." },
      { name: "Biotechnology", mastery: 90, status: "Excelled", suggestion: "Mastered PCR and DNA Recombinant technology." }
    ],
    "11th": [
      { name: "Cell Structure", mastery: 95, status: "Excelled", suggestion: "Mastery achieved." },
      { name: "Respiration", mastery: 42, status: "Critical", suggestion: "Focus on Glycolysis and Krebs Cycle flowcharts." }
    ]
  }
};