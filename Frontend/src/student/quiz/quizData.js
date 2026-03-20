/* ══════════════════════════════════════════════
    QUIZ DATA — SUBJECTS, CHAPTERS, QUESTIONS
    Updated for Nexus Quiz Engine v2 (Blocks & Explanations)
══════════════════════════════════════════════ */

export const SUBJECTS = [
    { id: 'physics', name: 'Physics', emoji: '⚛️', chapters: 12, bg: '#EEF2FF', border: '#C7D2FE', accent: '#4F46E5', light: '#EEF2FF' },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪', chapters: 10, bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', light: '#FFF7ED' },
    { id: 'biology', name: 'Biology', emoji: '🔬', chapters: 14, bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', light: '#F0FDF4' },
    { id: 'maths', name: 'Mathematics', emoji: '📐', chapters: 16, bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', light: '#FDF4FF' },
];

export const CHAPTERS = {
    physics: [{ id: 'p1', name: 'Laws of Motion', topics: 4, diff: 'Medium', emoji: '🏃', topicList: ["Newton's Laws", "Friction", "Circular Motion"] }],
    chemistry: [{ id: 'c1', name: 'Basic Concepts of Chemistry', topics: 4, diff: 'Easy', emoji: '🔬', topicList: ['Mole Concept', 'Stoichiometry'] }],
    biology: [{ id: 'b1', name: 'Reproduction in Plants', topics: 5, diff: 'Medium', emoji: '🌱', topicList: ['Pollination', 'Fertilization'] }],
    maths: [{ id: 'm1', name: 'Calculus', topics: 5, diff: 'Hard', emoji: '∫', topicList: ['Differentiation', 'Integration'] }],
};

export const QUESTIONS = {
    physics: [
        {
            id: "p1-q1",
            q: "A body of mass 2 kg moves with an acceleration of $5 m/s^2$. The net force acting on it is:",
            opts: ["2.5 N", "7 N", "10 N", "25 N"],
            ans: 2,
            explanation: "According to Newton's Second Law, $F = ma$. <br/> $F = 2 kg \\times 5 m/s^2 = 10 N$."
        },
        {
            id: "p1-q2",
            q: "Which law of motion explains the 'recoil of a gun'?",
            opts: ["First Law", "Second Law", "Third Law", "Law of Inertia"],
            ans: 2,
            explanation: "Newton's <strong>Third Law</strong> states that for every action, there is an equal and opposite reaction. The bullet going forward is the action, the gun moving back is the reaction."
        },
        {
            id: "p1-q3",
            q: "The inertia of an object tends to cause the object to:",
            opts: ["Increase its speed", "Decrease its speed", "Resist any change in its state of motion", "Decelerate due to friction"],
            ans: 2,
            explanation: "<strong>Inertia</strong> is the inherent property of an object to resist any change in its state of rest or uniform motion."
        },
        {
            id: "p1-q4",
            q: "When a bus suddenly starts, the passengers lean backwards. This is an example of:",
            opts: ["Inertia of rest", "Inertia of motion", "Inertia of direction", "Newton's Third Law"],
            ans: 0,
            explanation: "The lower part of the body moves with the bus, but the upper part tries to remain at rest due to <strong>Inertia of Rest</strong>."
        },
        {
            id: "p1-q5",
            q: "Action and reaction forces act on:",
            opts: ["Same body in same direction", "Same body in opposite direction", "Different bodies in opposite direction", "Different bodies in same direction"],
            ans: 2,
            explanation: "Newton's Third Law forces <strong>always act on two different bodies</strong>; otherwise, they would cancel each other out and motion would be impossible."
        }
    ],
    chemistry: [
        {
            id: "c1-q1",
            q: "What is the molar mass of Heavy Water ($D_2O$)?",
            opts: ["18 g/mol", "20 g/mol", "22 g/mol", "19 g/mol"],
            ans: 1,
            explanation: "Atomic mass of Deuterium (D) is 2. <br/> $Molar Mass = (2 \\times 2) + 16 = 20 g/mol$."
        },
        {
            id: "c1-q2",
            q: "The number of atoms present in 1 mole of an element is:",
            opts: ["$6.022 \\times 10^{23}$", "$6.022 \\times 10^{-23}$", "$3.011 \\times 10^{23}$", "$12.044 \\times 10^{23}$"],
            ans: 0,
            explanation: "This value is known as <strong>Avogadro's Number</strong> ($N_A$)."
        },
        {
            id: "c1-q3",
            q: "Which of the following has the maximum number of molecules?",
            opts: ["7g $N_2$", "2g $H_2$", "16g $O_2$", "20g $NO_2$"],
            ans: 1,
            explanation: "Moles = Mass / Molar Mass. <br/> $N_2 = 7/28 = 0.25$ <br/> $H_2 = 2/2 = 1.0$ (Highest) <br/> $O_2 = 16/32 = 0.5$."
        },
        {
            id: "c1-q4",
            q: "One mole of $CO_2$ contains:",
            opts: ["$6.022 \\times 10^{23}$ atoms of C", "$6.022 \\times 10^{23}$ atoms of O", "$18.1 \\times 10^{23}$ molecules of $CO_2$", "3 gnd-atoms of $CO_2$"],
            ans: 0,
            explanation: "1 molecule of $CO_2$ has 1 atom of Carbon. Therefore, 1 mole of $CO_2$ has 1 mole of Carbon atoms ($6.022 \\times 10^{23}$)."
        },
        {
            id: "c1-q5",
            q: "The empirical formula of Benzene ($C_6H_6$) is:",
            opts: ["$C_3H_3$", "$CH$", "$C_6H_6$", "$C_2H_2$"],
            ans: 1,
            explanation: "Empirical formula is the <strong>simplest whole-number ratio</strong>. For $C_6H_6$, the ratio 6:6 simplifies to 1:1, which is $CH$."
        }
    ],
    biology: [
        {
            id: "b1-q1",
            q: "The fertilization process in which non-motile male gametes are transported up to the female gamete through pollen tube is called",
            opts: ["siphonogamy", "triple fusion", "xenogamy", "autogamy"],
            ans: 0,
            explanation: "<strong>Siphonogamy</strong> is the process in which non-motile male gametes are carried to the female gamete through the pollen tube."
        },
        {
            id: "b1-q2",
            q: "Double fertilization is a characteristic feature of:",
            opts: ["Algae", "Gymnosperms", "Angiosperms", "Pteridophytes"],
            ans: 2,
            explanation: "<strong>Double fertilization</strong> (Syngamy + Triple Fusion) is unique to flowering plants (Angiosperms)."
        },
        {
            id: "b1-q3",
            q: "The number of pollen sacs in a dithecous anther is:",
            opts: ["8", "6", "4", "2"],
            ans: 2,
            explanation: "A dithecous anther has 2 thecae, each containing 2 pollen sacs. Total $= 2 \\times 2 = 4$ pollen sacs."
        },
        {
            id: "b1-q4",
            q: "Which part of the embryo sac gets fertilized to form the endosperm?",
            opts: ["Egg cell", "Synergids", "Antipodal cells", "Secondary nucleus"],
            ans: 3,
            explanation: "The second male gamete fuses with the <strong>Secondary Nucleus</strong> (diploid) to form the triploid Primary Endosperm Nucleus (PEN)."
        },
        {
            id: "b1-q5",
            q: "Pollen grains are well preserved as fossils because of the presence of:",
            opts: ["Pectocellulose", "Lignin", "Sporopollenin", "Cutin"],
            ans: 2,
            explanation: "<strong>Sporopollenin</strong> is one of the most resistant organic materials known. It can withstand high temperatures and strong acids/alkalis."
        }
    ],
    maths: [
        {
            id: "m1-q1",
            q: "What is the derivative of $\\sin(x^2)$ with respect to $x$?",
            opts: ["$2x \\cos(x^2)$", "$\\cos(x^2)$", "$2 \\sin(x)$", "$-2x \\cos(x^2)$"],
            ans: 0,
            explanation: "Using the <strong>Chain Rule</strong>: $\\frac{d}{dx}[\\sin(u)] = \\cos(u) \\cdot \\frac{du}{dx}$. <br/> Here $u = x^2$, so $\\frac{du}{dx} = 2x$. Result: $2x \\cos(x^2)$."
        },
        {
            id: "m1-q2",
            q: "The value of $\\int e^x dx$ is:",
            opts: ["$xe^{x-1} + C$", "$e^x + C$", "$\\frac{e^x}{x} + C$", "$\\log(e^x) + C$"],
            ans: 1,
            explanation: "The exponential function $e^x$ is unique because its <strong>integral and derivative are the same</strong>."
        },
        {
            id: "m1-q3",
            q: "If $y = \\log(\\sin x)$, then $dy/dx$ is:",
            opts: ["$\\tan x$", "$\\cot x$", "$\\sec x$", "$\\operatorname{cosec} x$"],
            ans: 1,
            explanation: "$\\frac{d}{dx}[\\log(\\sin x)] = \\frac{1}{\\sin x} \\cdot \\cos x = \\cot x$."
        },
        {
            id: "m1-q4",
            q: "What is the slope of the tangent to the curve $y = x^2$ at the point (1,1)?",
            opts: ["1", "2", "3", "0"],
            ans: 1,
            explanation: "Slope $m = dy/dx$. <br/> $dy/dx = 2x$. At $x=1, m = 2(1) = 2$."
        },
        {
            id: "m1-q5",
            q: "Evaluate $\\int_0^{\\pi/2} \\cos x dx$:",
            opts: ["0", "1", "-1", "$\\pi$"],
            ans: 1,
            explanation: "$\\int \\cos x dx = [\\sin x]_0^{\\pi/2}$. <br/> $\\sin(\\pi/2) - \\sin(0) = 1 - 0 = 1$."
        }
    ]
};