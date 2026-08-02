import { useState } from "react";
import { Heart, MessageCircle, Share2, Search, Pin, Edit3, Bookmark, X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunityPosts, createCommunityPost, likePost, type CommunityPost } from "@/lib/api";

/* ─── Seed posts shown when DB is empty ─────────────────────────────────── */
const SEED_FEED: Partial<CommunityPost>[] = [
  { id: "s1", name: "Ananya Rao", handle: "@curious_mind", avatar: "A", text: "Just mapped out my entire History syllabus into one visual canvas. 3 chapters in 20 minutes! 🗺️ Anyone else studying the Mughal Empire this week?", board_label: "History — Mughal Empire Mind Map", time: "2h", likes: 128, replies: 14, rotation: "rotate-2", tape_rotate: "-rotate-2", paper_color: "bg-[#fffce8]" },
  { id: "s2", name: "Dev Mehta", handle: "@dev_studies", avatar: "D", text: "SuperrBook turned my 40-page biology PDF into a mind map. I actually understand the Calvin Cycle now 🧬 Shared my study board below!", board_label: "Biology — Photosynthesis Visual Notes", time: "5h", likes: 256, replies: 31, rotation: "-rotate-1", tape_rotate: "rotate-1", paper_color: "bg-white" },
  { id: "s3", name: "Priya Sharma", handle: "@priya.learns", avatar: "P", text: "The pop quiz feature caught me off guard but I scored 9/10. Active recall is no joke 🎯 Feel free to fork my physics quiz if you have an exam coming up.", board_label: "Physics — Newton's Laws Study Board", time: "8h", likes: 189, replies: 22, rotation: "rotate-1", tape_rotate: "-rotate-3", paper_color: "bg-[#fdf8b5]" },
  { id: "s4", name: "Aman Gupta", handle: "@aman_numbers", avatar: "AG", text: "Can someone share a good visual board for Polynomials? I'm struggling with the algebraic identities 😅", board_label: "Math — Algebra Pending", time: "12h", likes: 45, replies: 18, rotation: "-rotate-2", tape_rotate: "rotate-2", paper_color: "bg-white" },
];

/* ─── Create Post Modal ─────────────────────────────────────────────────── */
interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (text: string, boardLabel: string) => void;
  isPending: boolean;
}

const CreatePostModal = ({ onClose, onSubmit, isPending }: CreatePostModalProps) => {
  const [text, setText] = useState("");
  const [boardLabel, setBoardLabel] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdfaf5] border-2 border-[#e8dfd5] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-black/5 rounded-full">
          <X className="w-5 h-5 text-[#382618]/60" />
        </button>
        <h2 className="font-handwritten text-3xl text-[#382618] mb-1">Pin to the Board 📌</h2>
        <p className="text-sm text-[#382618]/60 font-medium mb-6">Share your study wins with the community.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#382618]/60 mb-1.5 block">
              What's on your mind?
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share a study win, ask for help, or show off your notes..."
              rows={4}
              className="w-full bg-white border-2 border-[#e8dfd5] rounded-xl py-3 px-4 font-handwritten text-xl text-[#382618] focus:border-[#fa7533] outline-none transition-colors resize-none leading-snug placeholder:text-[#382618]/30 placeholder:font-sans placeholder:text-sm placeholder:font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#382618]/60 mb-1.5 block">
              Board / Topic Label
            </label>
            <input
              type="text"
              value={boardLabel}
              onChange={(e) => setBoardLabel(e.target.value)}
              placeholder="e.g. Biology — Photosynthesis Visual Notes"
              className="w-full bg-white border-2 border-[#e8dfd5] rounded-xl py-3 px-4 font-bold text-[#382618] focus:border-[#fa7533] outline-none transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit(text, boardLabel)}
          disabled={!text.trim() || !boardLabel.trim() || isPending}
          className="mt-6 w-full bg-[#fa7533] text-white font-bold py-3 rounded-xl hover:bg-[#e8601c] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Send className="w-4 h-4" /> Pin it!</>}
        </button>
      </div>
    </div>
  );
};

/* ─── Community Component ───────────────────────────────────────────────── */
const Community = () => {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});

  /* Fetch posts */
  const { data: dbPosts = [], isLoading } = useQuery({
    queryKey: ["community_posts"],
    queryFn: getCommunityPosts,
  });

  const feed: Partial<CommunityPost>[] = dbPosts.length > 0 ? dbPosts : SEED_FEED;

  /* Filter by search */
  const filtered = searchTerm
    ? feed.filter(
        (p) =>
          p.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.board_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : feed;

  /* Create post */
  const createMutation = useMutation({
    mutationFn: ({ text, boardLabel }: { text: string; boardLabel: string }) => {
      const displayName = profile?.full_name || user?.email?.split("@")[0] || "Anonymous";
      const handle = "@" + (user?.email?.split("@")[0] ?? "user");
      const avatarLetter = displayName.charAt(0).toUpperCase();
      return createCommunityPost(text, boardLabel, displayName, handle, avatarLetter, user?.id ?? undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community_posts"] });
      setShowModal(false);
      toast.success("Your note is pinned to the board! 📌");
    },
    onError: () => toast.error("Failed to post. Try again."),
  });

  /* Like post (optimistic) */
  const handleLike = async (post: Partial<CommunityPost>) => {
    if (!post.id || post.id.startsWith("s")) {
      toast.info("Sign in to like posts!");
      return;
    }
    const currentLikes = localLikes[post.id] ?? post.likes ?? 0;
    setLocalLikes((prev) => ({ ...prev, [post.id!]: currentLikes + 1 }));
    try {
      await likePost(post.id, currentLikes);
      qc.invalidateQueries({ queryKey: ["community_posts"] });
    } catch {
      setLocalLikes((prev) => ({ ...prev, [post.id!]: currentLikes }));
    }
  };

  return (
    <>
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onSubmit={(text, boardLabel) => createMutation.mutate({ text, boardLabel })}
          isPending={createMutation.isPending}
        />
      )}

      <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-7xl mx-auto w-full relative">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between z-10 px-4">
          <div>
            <h1 className="text-4xl font-black text-[#382618] inline-flex items-center gap-3">
              <Pin className="w-8 h-8 text-[#fa7533]" />
              The Notice Board
            </h1>
            <p className="font-handwritten text-[#fa7533] text-xl mt-1">pin your best work, steal the rest.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#382618]/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mind maps..."
                className="bg-[#fffae8] border-2 border-[#e8df81] rounded-full py-2.5 pl-10 pr-4 text-sm focus:border-[#fa7533] outline-none shadow-sm transition-all w-64 text-[#382618] font-bold placeholder:text-[#382618]/40"
              />
            </div>
            <button
              onClick={() => {
                if (!user) { toast.error("Please sign in to post."); return; }
                setShowModal(true);
              }}
              className="hidden sm:flex bg-[#fa7533] text-white border-2 border-[#fa7533] hover:bg-[#e8601c] px-4 py-2.5 rounded-full font-bold items-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all"
            >
              <Edit3 className="w-4 h-4" /> Post
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-12 scrollbar-hide px-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto w-full">

            {isLoading && (
              <div className="col-span-full py-12 text-center text-[#382618]/40 font-bold animate-pulse flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-[#382618]/40 font-bold text-lg">Nothing matches your search.</p>
              </div>
            )}

            {!isLoading && filtered.map((post, i) => (
              <div key={post.id ?? i} className={`relative ${post.rotation ?? "rotate-0"} hover:rotate-0 transition-transform duration-300 w-full`}>
                {/* Masking Tape */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#f0f0f0]/80 shadow-sm z-10 border border-white/50 backdrop-blur-sm ${post.tape_rotate ?? ""}`}
                  style={{ clipPath: "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)" }}
                />
                <div className={`border-2 border-border/80 ${post.paper_color ?? "bg-white"} p-6 pb-4 shadow-[4px_8px_16px_rgba(0,0,0,0.08)] group`}>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-5 border-b-2 border-border/40 pb-3 border-dashed">
                    <div className="w-10 h-10 rounded-full bg-[#382618] flex items-center justify-center text-sm font-black text-white shadow-inner">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-black text-[#382618] leading-tight text-sm tracking-wide">{post.name}</p>
                      <p className="text-xs text-[#fa7533] font-bold">{post.handle}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-muted-foreground bg-black/5 px-2 py-0.5 rounded-sm">
                      {post.time}
                    </span>
                  </div>

                  {/* Note text */}
                  <p className="text-[#1c1f2e] mb-5 font-handwritten text-2xl leading-snug font-bold">
                    {post.text}
                  </p>

                  {/* Board card */}
                  <div
                    onClick={() => toast.info(`Viewing: ${post.board_label}`)}
                    className="bg-white border-2 border-border/60 p-2 pb-6 flex flex-col items-center justify-center mb-5 cursor-pointer shadow-sm group-hover:shadow-[4px_4px_0_0_rgb(250,117,51,0.2)] transition-shadow"
                  >
                    <div className="bg-muted/30 w-full aspect-video flex items-center justify-center border border-border/40 mb-3 hover:bg-muted/50 transition-colors">
                      <span className="text-3xl opacity-50">🗂️</span>
                    </div>
                    <p className="font-bold text-[#382618] text-sm uppercase tracking-wider">{post.board_label}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-6 text-[#382618]/70 font-bold">
                    <button
                      onClick={() => handleLike(post)}
                      className="flex items-center gap-1.5 text-xs hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors -ml-2"
                    >
                      <Heart className="w-4 h-4" />
                      {localLikes[post.id!] ?? post.likes ?? 0}
                    </button>
                    <button
                      onClick={() => toast.info("Thread coming soon!")}
                      className="flex items-center gap-1.5 text-xs hover:text-blue-500 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.replies ?? 0}
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                      className="flex items-center gap-1.5 text-xs hover:text-[#fa7533] hover:bg-orange-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toast.success("Saved to your Notebooks!")}
                      className="flex items-center gap-1.5 text-xs hover:text-[#fa7533] hover:bg-orange-50 px-2 py-1 rounded-md transition-colors ml-auto"
                    >
                      <Bookmark className="w-4 h-4" /> Save
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
