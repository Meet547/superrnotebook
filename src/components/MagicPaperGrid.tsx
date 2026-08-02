import { motion } from "framer-motion";
import { Upload, LayoutDashboard, BrainCircuit } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Ingest & Transform",
    description: "Upload dense docs, research papers, or books. Our AI reads it all.",
    visual: (
      <div className="mt-4 rounded-xl bg-muted/50 border border-border p-4 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-primary/20 text-[8px] flex items-center justify-center">📄</div>
          <span className="text-[10px] font-bold text-muted-foreground">biology_ch5.pdf</span>
          <span className="ml-auto text-[9px] text-primary font-bold">Processing...</span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-[4px] rounded-full bg-muted-foreground/15"
            style={{ width: `${55 + Math.sin(i * 2) * 35}%` }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
          />
        ))}
        <motion.div
          className="h-1 rounded-full bg-primary/40 mt-3"
          initial={{ width: "0%" }}
          whileInView={{ width: "75%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </div>
    ),
  },
  {
    num: "02",
    icon: LayoutDashboard,
    title: "The Interactive Canvas",
    description: "Transforms boring text into visual mind-maps, charts, and handwritten iPad-style notes.",
    visual: (
      <div className="mt-4 rounded-xl bg-muted/50 border border-border p-4 relative min-h-[120px]">
        <div className="flex gap-2 flex-wrap">
          <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-[10px] font-bold">Central Idea</div>
          <div className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-[10px]">Sub-topic A</div>
          <div className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-[10px]">Sub-topic B</div>
        </div>
        <svg className="absolute w-full h-full top-0 left-0 pointer-events-none opacity-30">
          <line x1="30%" y1="35%" x2="55%" y2="55%" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="30%" y1="35%" x2="75%" y2="55%" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        <div className="mt-6 font-handwritten text-primary/70 text-sm">
          ✏️ AI-generated visual notes...
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: BrainCircuit,
    title: "Active Recall",
    description: "Animated sticky notes pop up to test your knowledge as you scroll through your study boards.",
    visual: (
      <div className="mt-4 rounded-xl bg-muted/50 border border-border p-4 relative min-h-[120px] flex flex-col items-center justify-center">
        <motion.div
          className="bg-secondary border border-border rounded-xl p-3 shadow-sm rotate-[-2deg]"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <p className="font-handwritten text-primary font-bold text-base">Pop Quiz! 🎯</p>
          <p className="text-[10px] text-muted-foreground mt-1">What's the powerhouse of the cell?</p>
        </motion.div>
        <div className="flex gap-2 mt-3">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold border border-primary/20">Mitochondria ✓</div>
          <div className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-[10px]">Nucleus</div>
        </div>
      </div>
    ),
  },
];

const MagicPaperGrid = () => {
  return (
    <section className="relative z-10 py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-handwritten text-primary text-2xl mb-2">how it works</p>
          <h2 className="text-4xl md:text-5xl font-black">
            From dense text to{" "}
            <span className="text-primary font-handwritten text-5xl md:text-6xl">visual magic</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="rounded-2xl bg-card border border-border p-6 shadow-sm btn-press"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-handwritten text-primary text-lg">{step.num}</span>
              </div>
              <h3 className="text-lg font-black mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {step.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MagicPaperGrid;
