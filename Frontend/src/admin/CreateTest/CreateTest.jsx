import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import StepHeader from "./StepHeader";
import Step1Title from "./Step1Title";
import Step2Blueprint from "./Step2Blueprint";
import StepSyllabus from "./StepSyllabus";
import StepReview from "./StepReview";

export default function CreateTest() {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [topics, setTopics] = useState({});
  const [activeCustomizingId, setActiveCustomizingId] = useState(null);

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [isPyqOnly, setIsPyqOnly] = useState(false);
  const [mathBioType, setMathBioType] = useState("maths"); 

  const [phyChem, setPhyChem] = useState({ physicsQ: 50, chemistryQ: 50, time: 90 });
  const [mbConfig, setMbConfig] = useState({ questions: 50, time: 90 });

  const [phyDifficulty, setPhyDifficulty] = useState({ easy: 40, medium: 40, hard: 20 });
  const [chemDifficulty, setChemDifficulty] = useState({ easy: 40, medium: 40, hard: 20 });
  const [mbDifficulty, setMbDifficulty] = useState({ easy: 40, medium: 40, hard: 20 });

  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customQuestions, setCustomQuestions] = useState({});

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    api.get("/subjects").then(res => setSubjects(res.data));
  }, []);

  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.name.toLowerCase()] = s; });
    return map;
  }, [subjects]);

  const getSub = (name) => {
    const n = name?.toLowerCase();
    if (n === "maths" || n === "math") return subjectMap["mathematics"] || subjectMap["maths"];
    return subjectMap[n];
  };

  const fetchSyllabus = async (subjectName) => {
    const sub = getSub(subjectName);
    if (!sub || chapters[sub._id]) return sub?._id;
    const res = await api.get(`/chapters/subject/${sub._id}`);
    setChapters(prev => ({ ...prev, [sub._id]: res.data }));
    return sub._id;
  };

  /* ================= NAVIGATION ================= */
  const handleNext = async () => {
    if (step === 1) return setStep(2);
    if (step === 2) {
      await fetchSyllabus("physics");
      return setStep(3);
    }
    if (step === 3) {
      await fetchSyllabus("chemistry");
      return setStep(4);
    }
    if (step === 4) {
      await fetchSyllabus(mathBioType);
      return setStep(5);
    }
    if (step === 5) return setStep(6);
  };

  const handleSubmit = async () => {
    const payload = {
      title,
      isPyqOnly,
      subjectConfigs: [
        { subjectId: getSub("physics")?._id, questions: phyChem.physicsQ, time: phyChem.time, difficulty: phyDifficulty },
        { subjectId: getSub("chemistry")?._id, questions: phyChem.chemistryQ, time: phyChem.time, difficulty: chemDifficulty },
        { subjectId: getSub(mathBioType)?._id, questions: mbConfig.questions, time: mbConfig.time, difficulty: mbDifficulty }
      ].filter(c => c.subjectId),
      chapterIds: selectedChapters,
      topicIds: selectedTopics,
      customQuestions
    };
    await api.post("/tests", payload);
    alert("🚀 Test Published Successfully");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <StepHeader step={step} setStep={setStep} />
        <div className="p-8">
          {step === 1 && <Step1Title title={title} setTitle={setTitle} isPyqOnly={isPyqOnly} setIsPyqOnly={setIsPyqOnly} onNext={handleNext} />}
          {step === 2 && <Step2Blueprint mathBioType={mathBioType} setMathBioType={setMathBioType} phyChem={phyChem} setPhyChem={setPhyChem} mbConfig={mbConfig} setMbConfig={setMbConfig} onBack={() => setStep(1)} onNext={handleNext} />}
          {[3, 4, 5].includes(step) && (
            <StepSyllabus
              subId={getSub(step === 3 ? "physics" : step === 4 ? "chemistry" : mathBioType)?._id}
              subName={step === 3 ? "Physics" : step === 4 ? "Chemistry" : mathBioType}
              difficulty={step === 3 ? phyDifficulty : step === 4 ? chemDifficulty : mbDifficulty}
              setDifficulty={step === 3 ? setPhyDifficulty : step === 4 ? setChemDifficulty : setMbDifficulty}
              chapters={chapters} topics={topics} setTopics={setTopics}
              selectedChapters={selectedChapters} setSelectedChapters={setSelectedChapters}
              selectedTopics={selectedTopics} setSelectedTopics={setSelectedTopics}
              customQuestions={customQuestions} setCustomQuestions={setCustomQuestions}
              activeCustomizingId={activeCustomizingId} setActiveCustomizingId={setActiveCustomizingId}
              onBack={() => setStep(step - 1)} onNext={handleNext}
            />
          )}
          {step === 6 && <StepReview title={title} phyChem={phyChem} mbConfig={mbConfig} mathBioType={mathBioType} onBack={() => setStep(5)} onPublish={handleSubmit} />}
        </div>
      </div>
    </div>
  );
}