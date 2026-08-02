import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import WaitlistModal from "./WaitlistModal";

const NotebookHero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Notebook cover opens (rotates away) as user scrolls
  const coverRotate = useTransform(scrollYProgress, [0, 0.35], [0, -160]);
  const coverOpacity = useTransform(scrollYProgress, [0.25, 0.4], [1, 0]);

  // Screen content fades in
  const screenOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);
  const screenScale = useTransform(scrollYProgress, [0.2, 0.45], [0.95, 1]);

  // Feature panels slide in sequentially
  const panel1Y = useTransform(scrollYProgress, [0.35, 0.5], [40, 0]);
  const panel1Opacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const panel2Y = useTransform(scrollYProgress, [0.45, 0.6], [40, 0]);
  const panel2Opacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const panel3Y = useTransform(scrollYProgress, [0.55, 0.7], [40, 0]);
  const panel3Opacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);

  return (
    <div ref={sectionRef} className="relative min-h-[250vh]">
      <div className="sticky top-0 min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
        <div className="w-full max-w-6xl">
          {/* Two-column layout: text left, device right */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left: Hero Text */}
            <motion.div
              className="flex-1 text-center md:text-left mt-[-8vh]"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-handwritten text-3xl md:text-4xl text-[#fa7533] mb-1">Dear grownups,</p>
              <h1 className="text-7xl md:text-[110px] font-black leading-[0.9] tracking-tighter mb-8 text-[#382618]">
                meet<br />superrbook
              </h1>
              <p className="text-xl md:text-3xl font-medium text-foreground leading-tight max-w-xl">
                It's an AI notebook that <span className="font-handwritten text-[#fa7533] text-3xl md:text-5xl ml-1">actually!</span><br />
                makes learning fun
              </p>
              <div className="mt-12">
                <WaitlistModal>
                  <button className="btn-dibs text-4xl px-12 py-4">
                    Join Waitlist
                  </button>
                </WaitlistModal>
                <p className="mt-8 text-sm text-foreground/60 font-medium">Pre-order starting March 2026.</p>
              </div>
            </motion.div>

            {/* Right: iPad/Notebook Device */}
            <div className="flex-1 flex justify-center mt-12 md:mt-0" style={{ perspective: "1500px" }}>
              <div className="relative w-[320px] h-[420px] md:w-[400px] md:h-[520px] rotate-[8deg] md:rotate-[12deg] hover:rotate-[10deg] transition-transform duration-500">

                {/* Yellow Pencil attached to the right edge */}
                <div className="absolute top-[35%] -right-4 w-4 h-48 bg-[#f6b921] rounded-sm transform flex flex-col z-0 shadow-lg border-r border-[#d4990d]">
                   <div className="h-6 w-full bg-[#e3e3e3] border-b border-t border-[#c0c0c0] flex flex-col justify-evenly">
                      {/* Metal ferrule bands */}
                      <div className="h-[2px] w-full bg-[#afafaf]"></div>
                      <div className="h-[2px] w-full bg-[#afafaf]"></div>
                   </div>
                   <div className="h-4 w-full bg-[#ff7b88] rounded-t-sm order-first"></div>
                   {/* Pencil Core / Point */}
                   <div className="mt-auto h-8 w-full bg-[#fbd4a3] clip-triangle border-b-8 border-b-zinc-800 rounded-b-full"></div>
                </div>

                {/* Device Frame (iPad-like) */}
                <div
                  className="absolute inset-0 rounded-[24px] md:rounded-[32px] overflow-hidden"
                  style={{
                    boxShadow: "20px 20px 60px -15px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Screen Area (revealed content) */}
                  <motion.div
                    className="absolute inset-0 bg-[#f8f5f0] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-inner"
                    style={{ opacity: screenOpacity, scale: screenScale }}
                  >
                    {/* Window Chrome */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-white">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      <span className="ml-3 text-xs text-muted-foreground font-semibold">SuperrBook Canvas</span>
                    </div>

                    <div className="p-6 space-y-4 overflow-hidden h-full relative">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                      {/* Feature Panel 1: Mind Map */}
                      <motion.div
                        className="rounded-2xl bg-white shadow-sm border border-border/50 p-4 relative z-10"
                        style={{ y: panel1Y, opacity: panel1Opacity }}
                      >
                        <p className="text-xs font-bold text-muted-foreground mb-3 tracking-wide">🗺️ Mind Map</p>
                        <div className="flex items-center gap-3">
                          <div className="bg-[#fa7533] text-white rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm">
                            🌱 Photosynthesis
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-[10px] font-bold">☀️ Light</div>
                            <div className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-[10px] font-bold">🧬 Calvin</div>
                          </div>
                        </div>
                        <svg className="w-full h-8 -mt-5 pointer-events-none opacity-40">
                          <line x1="45%" y1="20%" x2="60%" y2="5%" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 3" />
                          <line x1="45%" y1="20%" x2="60%" y2="95%" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 3" />
                        </svg>
                      </motion.div>

                      {/* Feature Panel 2: AI Notes */}
                      <motion.div
                        className="rounded-2xl bg-[#fffae8] border border-[#f0e6c8] p-4 shadow-sm"
                        style={{ y: panel2Y, opacity: panel2Opacity }}
                      >
                        <p className="text-xs font-bold text-amber-700/60 mb-2">✏️ AI Notes</p>
                        <p className="font-handwritten text-xl font-bold text-amber-900 leading-snug">
                          6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
                        </p>
                        <p className="font-handwritten text-amber-800/70 text-lg mt-1">
                          Plants convert sunlight to energy! 🌻
                        </p>
                      </motion.div>

                      {/* Feature Panel 3: Pop Quiz */}
                      <motion.div
                        className="rounded-2xl bg-primary/5 border border-primary/10 p-4 shadow-sm"
                        style={{ y: panel3Y, opacity: panel3Opacity }}
                      >
                        <p className="font-handwritten text-primary text-xl font-bold">Pop Quiz! 🎯</p>
                        <p className="text-[11px] font-medium text-foreground/70 mt-1">What gas is released during photosynthesis?</p>
                        <div className="flex gap-2 mt-3">
                          <div className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-[10px] font-bold shadow-sm">O₂ ✓</div>
                          <div className="bg-white border border-border/50 text-muted-foreground rounded-full px-3 py-1 text-[10px] font-medium hover:bg-muted transition-colors">CO₂</div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Brown Notebook Cover (flips open) */}
                  <motion.div
                    className="absolute inset-0 rounded-[24px] md:rounded-[32px] z-10"
                    style={{
                      rotateY: coverRotate,
                      opacity: coverOpacity,
                      transformOrigin: "left center",
                      backgroundColor: "#af7d54", /* Exact tone matches the brown from the reference */
                      boxShadow: "inset -10px 0 20px rgba(0,0,0,0.05), inset 4px 0 10px rgba(255,255,255,0.15)",
                    }}
                  >
                    {/* Spine shading */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent rounded-l-[24px] md:rounded-l-[32px]"></div>

                    {/* Left edge binding detail overlay */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-[32px]"></div>

                    {/* Name Label Sticker */}
                    <div className="absolute top-[40%] text-black left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[14px] p-4 w-[75%] max-w-[260px] border-[1.5px] border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)] rotate-[-4deg]">
                      {/* Name section */}
                      <div className="border-b-[1.5px] border-black pb-3 mb-3 flex items-end">
                        <p className="text-[10px] font-bold text-black/70 mb-1 w-12">Name</p>
                        <p className="font-handwritten text-4xl text-black ml-4 leading-none transform translate-y-2">Param</p>
                      </div>
                      
                      {/* Class and Roll no section */}
                      <div className="flex">
                        <div className="flex-1 flex items-end border-r-[1.5px] border-black pr-3">
                          <p className="text-[9px] font-bold text-black/70 w-8 mb-1">Class</p>
                          <p className="font-handwritten font-bold text-2xl text-black ml-2 leading-none transform translate-y-1">VIII-A</p>
                        </div>
                        <div className="flex-1 flex items-end pl-3">
                          <p className="text-[9px] font-bold text-black/70 w-12 mb-1 leading-tight">Roll no.</p>
                          <p className="font-black text-lg text-black ml-auto leading-none text-right">20</p>
                        </div>
                      </div>
                      
                      {/* Internal inner border to match reference stroke style styling */}
                      <div className="absolute inset-1 border-[0.5px] border-black/30 rounded-[10px] pointer-events-none"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <motion.p
            className="text-center text-xs text-muted-foreground mt-12"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ↓ Scroll to open the notebook
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default NotebookHero;
