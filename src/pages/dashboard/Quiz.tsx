import { useState } from "react";
import { CheckCircle2, Target, Plus, BarChart2, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserQuizzes, createQuiz, deleteQuiz, type Quiz } from "@/lib/api";

const SUBJECT_COLORS: Record<string, { color: string; border: string }> = {
  Biology:    { color: "bg-green-100/50",  border: "border-green-200"  },
  History:    { color: "bg-amber-100/50",  border: "border-amber-200"  },
  Physics:    { color: "bg-blue-100/50",   border: "border-blue-200"   },
  Math:       { color: "bg-purple-100/50", border: "border-purple-200" },
  Chemistry:  { color: "bg-rose-100/50",   border: "border-rose-200"   },
  Geography:  { color: "bg-cyan-100/50",   border: "border-cyan-200"   },
  English:    { color: "bg-orange-100/50", border: "border-orange-200" },
  "Computer Science": { color: "bg-indigo-100/50", border: "border-indigo-200" },
  Other:      { color: "bg-violet-100/50", border: "border-violet-200" },
};

/* ── Create Quiz Modal ───────────────────────────────────────────────────── */
interface CreateQuizModalProps {
  onClose: () => void;
  onSubmit: (subject: string, topic: string) => void;
  isPending: boolean;
}

const SUBJECTS = Object.keys(SUBJECT_COLORS);

const CreateQuizModal = ({ onClose, onSubmit, isPending }: CreateQuizModalProps) => {
  const [subject, setSubject] = useState("Biology");
  const [topic, setTopic] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdfaf5] border-2 border-[#e8dfd5] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-black/5 rounded-full">
          <X className="w-5 h-5 text-[#382618]/60" />
        </button>
        <h2 className="font-handwritten text-3xl text-[#382618] mb-1">Generate Quiz 🎯</h2>
        <p className="text-sm text-[#382618]/60 font-medium mb-6">Create a new quiz for your study session.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#382618]/60 mb-1.5 block">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border-2 border-[#e8dfd5] rounded-xl py-3 px-4 font-bold text-[#382618] focus:border-[#fa7533] outline-none transition-colors appearance-none"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#382618]/60 mb-1.5 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis & Respiration"
              className="w-full bg-white border-2 border-[#e8dfd5] rounded-xl py-3 px-4 font-bold text-[#382618] focus:border-[#fa7533] outline-none transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit(subject, topic)}
          disabled={!topic.trim() || isPending}
          className="mt-6 w-full bg-[#fa7533] text-white font-bold py-3 rounded-xl hover:bg-[#e8601c] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Quiz</>}
        </button>
      </div>
    </div>
  );
};

/* ── Main Quiz Component ─────────────────────────────────────────────────── */
const Quiz = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null);

  /* Per-user quiz list */
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: getUserQuizzes,
    enabled: !!user,
  });

  /* Create quiz */
  const createMutation = useMutation({
    mutationFn: ({ subject, topic }: { subject: string; topic: string }) => {
      const { color, border } = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.Other;
      return createQuiz(subject, topic, color, border, user?.id ?? undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      setShowModal(false);
      toast.success("Quiz created! Let's get started. 🎯");
    },
    onError: () => toast.error("Failed to create quiz. Try again."),
  });

  /* Delete quiz */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz removed.");
    },
  });

  /* Sample pop quiz state */
  const SAMPLE_ANSWERS = [
    { label: "Carbon Dioxide", correct: false },
    { label: "Oxygen (O₂)", correct: true },
    { label: "Nitrogen", correct: false },
  ];

  return (
    <>
      {showModal && (
        <CreateQuizModal
          onClose={() => setShowModal(false)}
          onSubmit={(subject, topic) => createMutation.mutate({ subject, topic })}
          isPending={createMutation.isPending}
        />
      )}

      <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#382618]">Active Recall</h1>
            <p className="text-muted-foreground text-lg mt-1 font-medium">
              {quizzes.length > 0
                ? `You have ${quizzes.length} quiz${quizzes.length > 1 ? "zes" : ""} in your board.`
                : "Test your knowledge with AI-generated pop quizzes."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toast.info("Stats dashboard coming soon!")}
              className="bg-white border-2 border-[#e8dfd5] text-[#382618] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:border-[#fa7533] transition-all shadow-sm"
            >
              <BarChart2 className="w-5 h-5" /> Stats & History
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#fa7533] border-2 border-[#fa7533] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e8601c] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none"
            >
              <Plus className="w-5 h-5" /> Generate Quiz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Sample Pop Quiz Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 rounded-3xl bg-primary/5 border border-primary/20 p-6 shadow-sm rotate-[-1deg] hover:rotate-0 transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-24 h-24" />
            </div>
            <p className="font-handwritten text-[#fa7533] text-2xl font-bold mb-4">Pop Quiz! 🎯</p>
            <div className="space-y-4 relative z-10">
              <h3 className="font-black text-xl text-[#382618]">What gas is released during photosynthesis?</h3>
              <div className="space-y-3">
                {SAMPLE_ANSWERS.map(({ label, correct }) => (
                  <button
                    key={label}
                    onClick={() => setActiveAnswer(label)}
                    className={`w-full text-left rounded-xl p-4 font-bold transition-all border-2 flex justify-between items-center ${
                      activeAnswer === label
                        ? correct
                          ? "bg-[#fa7533] border-[#fa7533] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]"
                          : "bg-red-500 border-red-500 text-white"
                        : "bg-white border-border text-[#382618] hover:border-[#fa7533] hover:shadow-[4px_4px_0_0_rgba(250,117,51,0.2)]"
                    }`}
                  >
                    {label}
                    {activeAnswer === label && correct && <CheckCircle2 className="w-5 h-5 text-white" />}
                    {activeAnswer === label && !correct && <X className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveAnswer(null)}
                className="mt-2 font-handwritten text-lg text-primary underline underline-offset-4 decoration-2"
              >
                {activeAnswer ? "Reset →" : "Next Question →"}
              </button>
            </div>
          </div>

          {/* User's Quiz List */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full">
              <h2 className="font-bold text-lg text-[#382618] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">🎓</span>
                {user ? "Your Study Board" : "Sample Quizzes"}
              </h2>
            </div>

            {isLoading && (
              <div className="col-span-full py-8 text-center text-[#382618]/40 font-bold animate-pulse">
                Loading your quizzes...
              </div>
            )}

            {!isLoading && quizzes.length === 0 && (
              <div className="col-span-full py-8 text-center">
                <p className="text-[#382618]/40 font-bold text-lg mb-2">No quizzes yet!</p>
                <p className="text-sm text-[#382618]/30 font-medium">Click "Generate Quiz" to create your first one.</p>
              </div>
            )}

            {!isLoading && quizzes.map((q: Quiz) => (
              <div
                key={q.id}
                className={`rounded-2xl border ${q.border} p-5 ${q.color} shadow-sm hover:-translate-y-1 transition-all group cursor-pointer relative`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(q.id); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-red-400 transition-all"
                  title="Delete quiz"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#382618]/60 bg-white/50 px-2 py-1 rounded-md">
                    {q.subject}
                  </span>
                  {q.score !== "Pending" && (
                    <span className="text-sm font-handwritten font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {q.score}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#382618] text-lg leading-tight mb-2 group-hover:text-[#fa7533] transition-colors pr-6">
                  {q.topic}
                </h3>
                <p className="text-sm text-foreground/60 font-medium">
                  {q.active ? "Continue Quiz →" : q.score === "Pending" ? "Start Quiz" : "Review Answers"}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Quiz;
