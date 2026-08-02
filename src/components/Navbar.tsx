import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo - hand outline style */}
      <div className="text-3xl cursor-pointer text-[#382618]" title="SuperrBook">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
          <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.7-2.9l-2.5 2.5" />
          <path d="M9 23c-1.1 0-2-.9-2-2v-5" />
          <path d="M12 11V7a2 2 0 0 0-4 0" />
          <circle cx="12" cy="7" r="2" />
          <circle cx="16" cy="11" r="2" />
        </svg>
      </div>

      {/* Right side: Sign Up (dibs) only */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/login?tab=signup')}
          className="btn-dibs px-8 py-2 text-2xl"
        >
          Join Waitlist
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
