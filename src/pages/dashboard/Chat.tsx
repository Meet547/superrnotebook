import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, PenTool, Download, Share2, Sparkles, Plus, MessageSquare, PanelRightClose, PanelRight, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChatSessions,
  createChatSession,
  getChatMessages,
  sendMessage,
  deleteChatSession,
  type ChatSession,
  type ChatMessage,
} from "@/lib/api";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return "Today";
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const AI_WELCOME = (name: string) =>
  `Hi ${name}! ✨ I'm your SuperrBook AI. What are we studying today? I can help you draw mind maps, quiz you, or take messy notes and make them beautiful.`;

/* ─── Component ────────────────────────────────────────────────────────────── */
const Chat = () => {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";

  /* ── Fetch session list ────────────────────────────────────────────────── */
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["chat_sessions"],
    queryFn: getChatSessions,
    enabled: !!user,
  });

  /* ── Fetch messages for active session ─────────────────────────────────── */
  const { data: dbMessages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["chat_messages", activeSessionId],
    queryFn: () => getChatMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  /* Merge DB messages with any optimistic local ones */
  useEffect(() => {
    setLocalMessages(dbMessages);
  }, [dbMessages]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  /* ── Create new session ────────────────────────────────────────────────── */
  const createSession = useMutation({
    mutationFn: () => createChatSession("New Note", user?.id ?? undefined),
    onMutate: async () => {
      // Optimistic: add a temporary session instantly so the UI doesn't freeze
      const tempId = `temp-${Date.now()}`;
      const tempSession: ChatSession = {
        id: tempId,
        user_id: user?.id ?? "",
        title: "New Note",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      qc.setQueryData<ChatSession[]>(["chat_sessions"], (old = []) => [tempSession, ...old]);
      setActiveSessionId(tempId);
      setLocalMessages([]);
      return { tempId };
    },
    onSuccess: (session, _vars, ctx) => {
      // Replace temp session with real one from DB
      qc.setQueryData<ChatSession[]>(["chat_sessions"], (old = []) =>
        old.map((s) => (s.id === ctx?.tempId ? session : s))
      );
      setActiveSessionId(session.id);
      handleAIResponse(session.id, AI_WELCOME(displayName));
    },
    onError: (_err, _vars, ctx) => {
      // Roll back
      qc.setQueryData<ChatSession[]>(["chat_sessions"], (old = []) =>
        old.filter((s) => s.id !== ctx?.tempId)
      );
      setActiveSessionId(null);
      toast.error("Couldn't create a new note. Try again.");
    },
  });

  /* ── Delete session ────────────────────────────────────────────────────── */
  const deleteSession = useMutation({
    mutationFn: (id: string) => deleteChatSession(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["chat_sessions"] });
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setLocalMessages([]);
      }
      toast.success("Note deleted.");
    },
  });

  /* ── Send message ──────────────────────────────────────────────────────── */
  const handleAIResponse = async (sessionId: string, content: string) => {
    const msg = await sendMessage(sessionId, "ai", content);
    setLocalMessages((prev) => [...prev.filter((m) => m.id !== "temp-ai"), msg]);
    qc.invalidateQueries({ queryKey: ["chat_messages", sessionId] });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ensure we have a session
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const session = await createChatSession(input.slice(0, 40), user?.id ?? undefined);
        qc.setQueryData<ChatSession[]>(["chat_sessions"], (old = []) => [session, ...(old ?? [])]);
        sessionId = session.id;
        setActiveSessionId(session.id);
      } catch {
        toast.error("Failed to start a session.");
        return;
      }
    }

    const text = input;
    setInput("");
    setIsSending(true);

    // Optimistic user message
    const optimisticUser: ChatMessage = {
      id: "temp-" + Date.now(),
      session_id: sessionId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimisticUser]);

    try {
      const saved = await sendMessage(sessionId, "user", text);
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === optimisticUser.id ? saved : m))
      );
      qc.invalidateQueries({ queryKey: ["chat_sessions"] });

      // Optimistic AI typing indicator
      const typingMsg: ChatMessage = {
        id: "temp-ai",
        session_id: sessionId,
        role: "ai",
        content: "...",
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, typingMsg]);

      // Simulate AI response
      setTimeout(async () => {
        const replies = [
          "Great note! Want me to turn this into flashcards? ✨",
          "I've added that to your notes! Need a mind map to summarize it? 🗺️",
          "Perfect! I can generate a quiz from this whenever you're ready. 🎯",
          "Got it! Your notes are saved. Want to explore this topic deeper? 📚",
        ];
        const response = replies[Math.floor(Math.random() * replies.length)];
        await handleAIResponse(sessionId!, response);
        setIsSending(false);
      }, 1200);
    } catch {
      toast.error("Failed to save message.");
      setLocalMessages((prev) =>
        prev.filter((m) => m.id !== optimisticUser.id)
      );
      setIsSending(false);
    }
  };

  /* ── Active session info ────────────────────────────────────────────────── */
  const activeSession = sessions.find((s: ChatSession) => s.id === activeSessionId);
  const messages = activeSessionId ? localMessages : [];

  return (
    <div className="flex h-full w-full relative bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] overflow-hidden">
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-md border-b border-[#e8dfd5] flex items-center justify-between px-6 z-40">
        {/* Left: Session info */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#382618] text-sm">
            {activeSession ? activeSession.title : "New Canvas"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => createSession.mutate()}
              disabled={createSession.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#fa7533] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#e8601c] active:scale-95 transition-all"
              title="New note"
            >
              {createSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Center: Canvas tools */}
        <div className="flex gap-1 bg-white/80 rounded-full p-1 border border-[#e8dfd5]">
          <button className="p-2 hover:bg-[#fa7533]/10 rounded-full transition-colors" title="Draw">
            <PenTool className="w-5 h-5 text-[#382618]" />
          </button>
          <button className="p-2 hover:bg-[#fa7533]/10 rounded-full transition-colors" title="Text">
            <MessageSquare className="w-5 h-5 text-[#382618]" />
          </button>
          <button className="p-2 hover:bg-[#fa7533]/10 rounded-full transition-colors" title="Shapes">
            <ImagePlus className="w-5 h-5 text-[#382618]" />
          </button>
        </div>

        {/* Right: Action buttons & Chat toggle */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => toast.info("Export coming soon!")}
            className="px-3 py-2 bg-white border border-[#e8dfd5] text-[#382618] rounded-full font-bold text-xs hover:bg-[#f9f9f9] transition-all"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.info("Share to Community coming soon!")}
            className="px-3 py-2 bg-[#fa7533]/10 text-[#fa7533] border border-[#fa7533]/30 rounded-full font-bold text-xs hover:bg-[#fa7533]/20 transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.info("Quiz generator coming soon!")}
            className="px-3 py-2 bg-[#fa7533] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#e8601c] transition-all"
            title="Make Quiz"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#e8dfd5]/50" />
          <button
            onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
            className={`px-3 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 ${
              isChatPanelOpen
                ? "bg-[#fa7533] text-white shadow-md"
                : "bg-white border border-[#e8dfd5] text-[#382618] hover:bg-[#f9f9f9]"
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 mt-16 relative overflow-hidden">
        {/* Canvas/Whiteboard */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white via-[#fffdf2] to-[#faf8f3] relative overflow-auto">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Canvas content area */}
          {!activeSessionId && !sessionsLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-8 p-8 z-10">
              <div className="w-32 h-32 rounded-full bg-[#fa7533]/10 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-[#fa7533]/40" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-[#382618] mb-3">Start Your First Canvas</h2>
                <p className="text-base text-[#382618]/60 font-medium max-w-md mx-auto">
                  Create a new note to begin drawing, mind mapping, and collaborating with SuperrBook AI
                </p>
              </div>
              <button
                onClick={() => createSession.mutate()}
                disabled={createSession.isPending}
                className="flex items-center gap-3 px-8 py-4 bg-[#fa7533] text-white rounded-full font-bold text-base shadow-lg hover:bg-[#e8601c] active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6" /> Create Canvas
              </button>
            </div>
          ) : (
            <canvas
              id="superrbook-canvas"
              width={1200}
              height={800}
              style={{
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #fffdf2 0%, #faf8f3 100%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 5,
              }}
            >
              Canvas not supported.
            </canvas>
          )}
        </div>
      </div>

      {/* Right Chat Panel (Collapsible) */}
      <div
        className={`fixed right-0 top-16 bottom-0 bg-white border-l border-[#e8dfd5] shadow-lg transition-all duration-300 z-30 flex flex-col ${
          isChatPanelOpen ? "w-96" : "w-0"
        } overflow-hidden`}
      >
        {isChatPanelOpen && (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dfd5] bg-white/50 backdrop-blur-sm">
              <h3 className="font-bold text-lg text-[#382618]">Chat & Notes</h3>
              <button
                onClick={() => setIsChatPanelOpen(false)}
                className="p-1.5 hover:bg-[#fa7533]/10 rounded-lg transition-colors"
              >
                <PanelRightClose className="w-5 h-5 text-[#382618]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide">
              {msgsLoading && activeSessionId && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#fa7533]" />
                </div>
              )}

              {messages.length === 0 && !msgsLoading && activeSessionId && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
                  <MessageSquare className="w-8 h-8 text-[#fa7533]/30" />
                  <p className="text-sm text-[#382618]/50">No messages yet. Start chatting!</p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "ai" ? (
                    <div className="max-w-xs">
                      <div className="bg-[#fdf8b5] text-[#382618] p-3 rounded-lg shadow-sm border border-[#e8df81]">
                        <p className="font-bold text-xs text-[#d19c15] mb-1">✨ AI</p>
                        {m.content === "..." ? (
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#d19c15] rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-[#d19c15] rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-[#d19c15] rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        ) : (
                          <p className="text-sm">{m.content}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xs">
                      <div className="bg-white text-[#382618] p-3 rounded-lg shadow-sm border border-[#e8dfd5]">
                        <p className="text-sm">{m.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-[#e8dfd5] p-4 bg-white/50 backdrop-blur-sm">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI..."
                  className="flex-1 bg-white border border-[#e8dfd5] rounded-full py-2 px-4 text-sm focus:border-[#fa7533] focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="p-2 bg-[#fa7533] text-white rounded-full hover:bg-[#e8601c] disabled:opacity-50 transition-all"
                  title="Send"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
