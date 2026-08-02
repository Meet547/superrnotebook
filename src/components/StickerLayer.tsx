import { motion } from "framer-motion";

const stickers = [
  { emoji: "❤️", top: "15%", left: "8%", delay: 0, size: "text-2xl" },
  { emoji: "⚡", top: "25%", right: "12%", delay: 0.3, size: "text-3xl" },
  { emoji: "✨", bottom: "30%", left: "5%", delay: 0.6, size: "text-xl" },
  { emoji: "🌟", bottom: "20%", right: "8%", delay: 0.9, size: "text-2xl" },
];

const StickerLayer = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {stickers.map((s, i) => (
        <motion.div
          key={i}
          className={`sticker absolute ${s.size}`}
          style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1 + s.delay, type: "spring", stiffness: 200 }}
        >
          {s.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default StickerLayer;
