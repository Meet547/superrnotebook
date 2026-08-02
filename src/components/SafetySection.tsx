import { motion } from "framer-motion";

const SafetySection = () => {
  const items = [
    { icon: "🛡️", text: "Age-safe AI" },
    { icon: "📖", text: "Distraction-free" },
    { icon: "🌙", text: "Gentle on the eyes" },
    { icon: "📷", text: "No camera" },
    { icon: "🚫", text: "No ads" },
  ];

  return (
    <section className="relative z-10 py-24 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            We're in<br />good hands.
          </h2>
          <p className="font-handwritten text-2xl text-primary mb-12">
            it's designed for care, with care ❤️
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold text-sm">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
