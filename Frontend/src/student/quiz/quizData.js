/* ══════════════════════════════════════════════
   QUIZ DATA — SUBJECTS, CHAPTERS, QUESTIONS
   Extracted from StudentQuizFlow for reuse across
   all quiz sub-components.
══════════════════════════════════════════════ */

export const SUBJECTS = [
    { id: 'physics', name: 'Physics', emoji: '⚛️', chapters: 12, bg: '#EEF2FF', border: '#C7D2FE', accent: '#4F46E5', light: '#EEF2FF' },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪', chapters: 10, bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', light: '#FFF7ED' },
    { id: 'biology', name: 'Biology', emoji: '🔬', chapters: 14, bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', light: '#F0FDF4' },
    { id: 'maths', name: 'Mathematics', emoji: '📐', chapters: 16, bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', light: '#FDF4FF' },
];

export const CHAPTERS = {
    chemistry: [
        { id: 'c1', name: 'Basic Concepts of Chemistry', topics: 4, diff: 'Easy', emoji: '🔬', topicList: ['Mole Concept', 'Stoichiometry', 'Empirical Formula', 'Atomic Weights'] },
        { id: 'c2', name: 'Structure of Atom', topics: 5, diff: 'Hard', emoji: '⚗️', topicList: ['Bohr Model', 'Quantum Numbers', 'Orbitals', 'Electron Config', 'Periodic Properties'] },
        { id: 'c3', name: 'Classification of Elements', topics: 6, diff: 'Medium', emoji: '🧬', topicList: ['Periodic Table', 'Periodic Trends', 'Valency', 'Oxidation State', 'Noble Gases', 'Isotopes'] },
        { id: 'c4', name: 'Chemical Bonding', topics: 7, diff: 'Hard', emoji: '🔗', topicList: ['Ionic Bond', 'Covalent Bond', 'VSEPR', 'Hybridisation', 'Polarity', 'Resonance', 'Molecular Orbitals'] },
        { id: 'c5', name: 'States of Matter', topics: 4, diff: 'Easy', emoji: '💧', topicList: ['Solid State', 'Liquid State', 'Gaseous State', 'Plasma'] },
        { id: 'c6', name: 'Thermodynamics', topics: 5, diff: 'Medium', emoji: '⚡', topicList: ['First Law', 'Enthalpy', 'Entropy', 'Gibbs Energy', 'Hess Law'] },
        { id: 'c7', name: 'Equilibrium', topics: 5, diff: 'Hard', emoji: '⚖️', topicList: ['Le Chateliers Principle', 'Ionic Equilibrium', 'pH Scale', 'Solubility Product', 'Buffer Solutions'] },
        { id: 'c8', name: 'Redox Reactions', topics: 4, diff: 'Medium', emoji: '🔋', topicList: ['Oxidation Number', 'Balancing Equations', 'Electrochemical Cells', 'Standard Electrode Potential'] },
        { id: 'c9', name: 'Organic Chemistry Basics', topics: 6, diff: 'Medium', emoji: '🧪', topicList: ['IUPAC Nomenclature', 'Isomerism', 'Inductive Effect', 'Resonance Effect', 'Electrophiles', 'Nucleophiles'] },
        { id: 'c10', name: 'Hydrocarbons', topics: 5, diff: 'Medium', emoji: '🔥', topicList: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Hydrocarbons', 'Mechanism of Substitution'] },
        { id: 'c11', name: 'Environmental Chemistry', topics: 4, diff: 'Easy', emoji: '🌍', topicList: ['Air Pollution', 'Water Pollution', 'Greenhouse Effect', 'Ozone Depletion'] },
        { id: 'c12', name: 'Polymers & Biomolecules', topics: 5, diff: 'Easy', emoji: '🧵', topicList: ['Carbohydrates', 'Proteins', 'Vitamins', 'Synthetic Polymers', 'Biodegradable Polymers'] },
    ],
    physics: [
        { id: 'p1', name: 'Laws of Motion', topics: 4, diff: 'Easy', emoji: '🏃', topicList: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Friction"] },
        { id: 'p2', name: 'Work, Energy & Power', topics: 5, diff: 'Medium', emoji: '⚡', topicList: ['Work Done', 'Kinetic Energy', 'Potential Energy', 'Power', 'Conservation'] },
        { id: 'p3', name: 'Gravitation', topics: 4, diff: 'Medium', emoji: '🌍', topicList: ["Newton's Law of Gravitation", 'Escape Velocity', 'Orbital Motion', 'Satellites'] },
        { id: 'p4', name: 'Thermodynamics', topics: 5, diff: 'Hard', emoji: '🔥', topicList: ['Zeroth Law', 'First Law', 'Second Law', 'Entropy', 'Carnot Engine'] },
        { id: 'p5', name: 'Electrostatics', topics: 6, diff: 'Hard', emoji: '⚡', topicList: ["Coulomb's Law", 'Electric Field', 'Potential', 'Capacitance', 'Gauss Law', 'Dielectrics'] },
        { id: 'p6', name: 'Current Electricity', topics: 5, diff: 'Medium', emoji: '🔌', topicList: ["Ohm's Law", 'Kirchhoff’s Laws', 'Wheatstone Bridge', 'Potentiometer', 'Drift Velocity'] },
        { id: 'p7', name: 'Magnetic Effects', topics: 5, diff: 'Hard', emoji: '🧲', topicList: ['Biot-Savart Law', 'Ampere’s Law', 'Lorentz Force', 'Cyclotron', 'Magnetic Dipole'] },
        { id: 'p8', name: 'Electromagnetic Induction', topics: 4, diff: 'Medium', emoji: '🌀', topicList: ["Faraday's Law", "Lenz's Law", 'Self Induction', 'AC Generator'] },
        { id: 'p9', name: 'Ray Optics', topics: 6, diff: 'Medium', emoji: '👓', topicList: ['Reflection', 'Refraction', 'Total Internal Reflection', 'Lenses', 'Prisms', 'Optical Instruments'] },
        { id: 'p10', name: 'Wave Optics', topics: 4, diff: 'Hard', emoji: '🌊', topicList: ['Huygens Principle', 'Interference', 'Diffraction', 'Polarisation'] },
        { id: 'p11', name: 'Dual Nature of Matter', topics: 4, diff: 'Easy', emoji: '🌓', topicList: ['Photoelectric Effect', 'Einstein’s Equation', 'de-Broglie Wavelength', 'Davisson-Germer Exp'] },
        { id: 'p12', name: 'Atoms & Nuclei', topics: 5, diff: 'Medium', emoji: '☢️', topicList: ['Rutherford Model', 'Hydrogen Spectrum', 'Nuclear Fission', 'Radioactivity', 'Mass Defect'] },
    ],
    biology: [
        { id: 'b1', name: 'Cell Biology', topics: 5, diff: 'Easy', emoji: '🔬', topicList: ['Cell Structure', 'Cell Membrane', 'Nucleus', 'Organelles', 'Cell Division'] },
        { id: 'b2', name: 'Genetics', topics: 4, diff: 'Hard', emoji: '🧬', topicList: ["Mendel's Laws", 'DNA Replication', 'Transcription', 'Translation'] },
        { id: 'b3', name: 'Human Physiology', topics: 6, diff: 'Medium', emoji: '🫀', topicList: ['Digestive System', 'Circulatory System', 'Respiratory System', 'Nervous System', 'Endocrine', 'Excretory'] },
        { id: 'b4', name: 'Plant Physiology', topics: 5, diff: 'Medium', emoji: '🌱', topicList: ['Photosynthesis', 'Respiration in Plants', 'Plant Growth', 'Transport', 'Mineral Nutrition'] },
        { id: 'b5', name: 'Ecology & Environment', topics: 4, diff: 'Easy', emoji: '🌳', topicList: ['Ecosystems', 'Biodiversity', 'Population Growth', 'Environmental Issues'] },
        { id: 'b6', name: 'Evolution', topics: 4, diff: 'Medium', emoji: '🐒', topicList: ['Darwinism', 'Natural Selection', 'Human Evolution', 'Evidence of Evolution'] },
        { id: 'b7', name: 'Biotechnology', topics: 5, diff: 'Hard', emoji: '🧪', topicList: ['Recombinant DNA', 'PCR Technique', 'Gene Therapy', 'Cloning', 'Applications in Med'] },
        { id: 'b8', name: 'Human Reproduction', topics: 5, diff: 'Medium', emoji: '👶', topicList: ['Gametogenesis', 'Menstrual Cycle', 'Fertilisation', 'Embryonic Development', 'Reproductive Health'] },
        { id: 'b9', name: 'Microbes in Welfare', topics: 4, diff: 'Easy', emoji: '🦠', topicList: ['Antibiotics', 'Sewage Treatment', 'Biofertilizers', 'Industrial Microbes'] },
        { id: 'b10', name: 'Structural Organization', topics: 5, diff: 'Medium', emoji: '🦵', topicList: ['Animal Tissues', 'Plant Anatomy', 'Morphology of Plants', 'Cockroach Anatomy', 'Frog Anatomy'] },
        { id: 'b11', name: 'Diversity of Life', topics: 6, diff: 'Easy', emoji: '🦁', topicList: ['Taxonomy', 'Biological Classification', 'Monera', 'Protista', 'Fungi', 'Animal Kingdom'] },
        { id: 'b12', name: 'Biomolecules in Cells', topics: 4, diff: 'Medium', emoji: '🍬', topicList: ['Enzymes', 'Lipids', 'Amino Acids', 'Nucleic Acids'] },
    ],
    maths: [
        { id: 'm1', name: 'Calculus', topics: 5, diff: 'Hard', emoji: '∫', topicList: ['Limits', 'Continuity', 'Differentiation', 'Integration', 'Differential Equations'] },
        { id: 'm2', name: 'Algebra', topics: 4, diff: 'Medium', emoji: '🔢', topicList: ['Polynomials', 'Quadratic Equations', 'Sequences', 'Binomial Theorem'] },
        { id: 'm3', name: 'Trigonometry', topics: 4, diff: 'Easy', emoji: '📐', topicList: ['Ratios', 'Identities', 'Inverse Functions', 'Applications'] },
        { id: 'm4', name: 'Coordinate Geometry', topics: 5, diff: 'Medium', emoji: '📉', topicList: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola'] },
        { id: 'm5', name: 'Probability', topics: 4, diff: 'Hard', emoji: '🎲', topicList: ['Conditional Probability', 'Bayes Theorem', 'Random Variables', 'Bernoulli Trials'] },
        { id: 'm6', name: 'Statistics', topics: 4, diff: 'Easy', emoji: '📊', topicList: ['Mean & Median', 'Standard Deviation', 'Variance', 'Frequency Distribution'] },
        { id: 'm7', name: 'Matrices & Determinants', topics: 5, diff: 'Medium', emoji: '⊞', topicList: ['Matrix Operations', 'Inverses', 'Cramer’s Rule', 'Adjoint', 'Properties'] },
        { id: 'm8', name: 'Vector Algebra', topics: 4, diff: 'Medium', emoji: '↗️', topicList: ['Dot Product', 'Cross Product', 'Scalar Triple Product', 'Direction Cosines'] },
        { id: 'm9', name: '3D Geometry', topics: 5, diff: 'Hard', emoji: '🧊', topicList: ['Lines in Space', 'Planes', 'Shortest Distance', 'Angle between Planes', 'Coplanarity'] },
        { id: 'm10', name: 'Complex Numbers', topics: 4, diff: 'Hard', emoji: '𝑖', topicList: ['Argand Plane', 'Modulus', 'De Moivres Theorem', 'Roots of Unity'] },
        { id: 'm11', name: 'Sets & Relations', topics: 4, diff: 'Easy', emoji: '⭕', topicList: ['Venn Diagrams', 'Equivalence Relations', 'Functions', 'Mappings'] },
        { id: 'm12', name: 'Mathematical Reasoning', topics: 4, diff: 'Easy', emoji: '🧠', topicList: ['Statements', 'Tautology', 'Contradiction', 'Logic Gates'] },
    ],
};

export const QUESTIONS = {
    chemistry: [
        { id: 1, subj: 'chemistry', q: 'What is the molar mass of water (H₂O)?', opts: ['16 g/mol', '18 g/mol', '20 g/mol', '22 g/mol'], ans: 1 },
        { id: 2, subj: 'chemistry', q: 'Which element has atomic number 6?', opts: ['Nitrogen', 'Oxygen', 'Carbon', 'Boron'], ans: 2 },
        { id: 3, subj: 'chemistry', q: 'pH of a neutral solution at 25 °C?', opts: ['0', '7', '14', '1'], ans: 1 },
        { id: 4, subj: 'chemistry', q: 'Number of moles in 44 g of CO₂?', opts: ['1 mol', '2 mol', '0.5 mol', '3 mol'], ans: 0 },
        { id: 5, subj: 'chemistry', q: 'Which bond forms between Na and Cl?', opts: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], ans: 1 },
        { id: 6, subj: 'chemistry', q: "Avogadro's number is approximately?", opts: ['6.02×10²³', '3.01×10²³', '1.2×10²³', '9.1×10²³'], ans: 0 },
    ],
    physics: [
        { id: 1, subj: 'physics', q: "F = ma is Newton's which law?", opts: ['First', 'Second', 'Third', 'Zeroth'], ans: 1 },
        { id: 2, subj: 'physics', q: 'Speed of light in vacuum?', opts: ['3×10⁸ m/s', '3×10⁶ m/s', '1.5×10⁸ m/s', '9×10⁸ m/s'], ans: 0 },
        { id: 3, subj: 'physics', q: 'SI unit of force?', opts: ['Joule', 'Pascal', 'Newton', 'Watt'], ans: 2 },
        { id: 4, subj: 'physics', q: 'A car travels 200 miles in 4 hours. Average speed?', opts: ['40 Mph', '50 Mph', '60 Mph', '70 Mph'], ans: 1 },
        { id: 5, subj: 'physics', q: 'Work done = ?', opts: ['Force × time', 'Force × distance', 'Mass × velocity', 'Force ÷ distance'], ans: 1 },
        { id: 6, subj: 'physics', q: 'SI unit of energy?', opts: ['Watt', 'Newton', 'Joule', 'Pascal'], ans: 2 },
    ],
    biology: [
        { id: 1, subj: 'biology', q: 'Powerhouse of the cell?', opts: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], ans: 2 },
        { id: 2, subj: 'biology', q: 'DNA stands for?', opts: ['Deoxyribonucleic Acid', 'Diribonucleic Acid', 'Deoxyribose Acid', 'None'], ans: 0 },
        { id: 3, subj: 'biology', q: 'Which organ produces insulin?', opts: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], ans: 2 },
        { id: 4, subj: 'biology', q: 'How many chromosomes do humans have?', opts: ['23', '44', '46', '48'], ans: 2 },
    ],
    maths: [
        { id: 1, subj: 'maths', q: '5 men dig 5 holes in 5 hrs. 100 men dig 100 holes?', opts: ['1 Hour', '2 Hour', '5 Hour', '10 Hour'], ans: 2 },
        { id: 2, subj: 'maths', q: 'Derivative of x²?', opts: ['x', '2x', 'x/2', '2x²'], ans: 1 },
        { id: 3, subj: 'maths', q: 'Value of sin(90°)?', opts: ['0', '0.5', '1', '√2'], ans: 2 },
        { id: 4, subj: 'maths', q: 'What is 15% of 200?', opts: ['20', '25', '30', '35'], ans: 2 },
        { id: 5, subj: 'maths', q: '∫2x dx = ?', opts: ['x² + C', '2x² + C', 'x + C', '2x + C'], ans: 0 },
    ],
};
