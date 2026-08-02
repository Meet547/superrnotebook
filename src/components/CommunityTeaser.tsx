import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useRef } from "react";

const posts = [
  {
    name: "Ananya Rao",
    handle: "@curious_mind",
    avatar: "A",
    text: "Just mapped out my entire History syllabus into one visual canvas. 3 chapters in 20 minutes! 🗺️",
    boardLabel: "History — Mughal Empire Mind Map",
    time: "2h",
    likes: 128,
    replies: 14,
  },
  {
    name: "Dev Mehta",
    handle: "@dev_studies",
    avatar: "D",
    text: "SuperrBook turned my 40-page biology PDF into a mind map. I actually understand the Calvin Cycle now 🧬",
    boardLabel: "Biology — Photosynthesis Visual Notes",
    time: "5h",
    likes: 256,
    replies: 31,
  },
  {
    name: "Priya Sharma",
    handle: "@priya.learns",
    avatar: "P",
    text: "The pop quiz feature caught me off guard but I scored 9/10. Active recall is no joke 🎯",
    boardLabel: "Physics — Newton's Laws Study Board",
    time: "8h",
    likes: 189,
    replies: 22,
  },
];

const CommunityTeaser = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative z-10 py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-handwritten text-primary text-2xl mb-2">from the community</p>
          <h2 className="text-4xl md:text-5xl font-black">
            What students are sharing
          </h2>
        </motion.div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {posts.map((post, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 w-[340px] md:w-[400px] rounded-2xl bg-card border border-border p-5 shadow-sm snap-center"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-black text-foreground">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{post.name}</span>
                    <span className="text-xs text-muted-foreground">{post.handle}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{post.time}</span>
              </div>

              {/* Caption */}
              <p className="text-sm leading-relaxed text-foreground mb-3">{post.text}</p>

              {/* Shared Visual Study Board Placeholder */}
              <div className="rounded-xl bg-muted/60 border border-border aspect-[16/9] flex flex-col items-center justify-center mb-3">
                <div className="text-3xl mb-2">🗂️</div>
                <p className="font-handwritten text-primary text-sm">{post.boardLabel}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Visual Study Board</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 text-muted-foreground">
                <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors btn-press">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors btn-press">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.replies}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors btn-press ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityTeaser;
