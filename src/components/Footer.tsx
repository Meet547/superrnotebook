import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="py-16 px-4 text-center">
      <motion.div
        className="mx-auto max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-handwritten text-primary text-xl mb-2">Like making</p>
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          Our SuperrBook.<br />Our Way.
        </h2>
        <div className="mt-8">
          {/* Removed login button as requested */}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © 2026 SuperrBook. Made with ❤️ for curious minds.
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
