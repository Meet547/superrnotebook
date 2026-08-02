import Navbar from "@/components/Navbar";
import NotebookHero from "@/components/NotebookHero";
import MagicPaperGrid from "@/components/MagicPaperGrid";
import CommunityTeaser from "@/components/CommunityTeaser";
import SafetySection from "@/components/SafetySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative scroll-smooth cursor-pencil" style={{ overflowX: 'clip' }}>
      <Navbar />
      <NotebookHero />
      <MagicPaperGrid />
      <CommunityTeaser />
      <SafetySection />
      <Footer />
    </div>
  );
};

export default Index;
