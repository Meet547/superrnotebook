import { PenSquare, FileText, Book, Layout, Plus, ArrowDownUp, MoreHorizontal, Download, Trash, FolderInput } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getLibraryMaterials, seedLibraryIfEmpty } from "@/lib/api";

const STOP_WORDS = new Set(["the", "and", "of", "to", "in", "a", "an", "is", "for", "with", "understanding", "part"]);

// A simple algorithm to extract keywords from titles to act as auto-tags
// For now, we'll combine the main subject and dominant keywords.
const extractKeywords = (text: string) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word));
}

const CARDS = [
  // Class 10 / High School Basics
  { type: "notebook", year: "Class 10", subject: "Biology", title: "Life Processes & Photosynthesis", authors: "Ms. Sharma's Class Notes", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "10", progress: 100 },
  { type: "items", year: "Class 10", subject: "History", title: "The Rise of Nationalism in Europe", authors: "NCERT Textbook PDF", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "4", progress: 75 },
  { type: "notebook", year: "Class 10", subject: "Physics", title: "Light - Reflection and Refraction", authors: "Param's Notes", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "3", progress: 40 },
  { type: "canvases", year: "Class 10", subject: "Math", title: "Trigonometry Cheat Sheet", authors: "Mr. Gupta's Handouts", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "12", progress: 0 },
  { type: "items", year: "Class 10", subject: "English", title: "Grammar & Essay Writing Formats", authors: "CBSE Prep Guide", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "2", progress: 80 },

  // Class 11-12 (Pre-University)
  { type: "canvases", year: "Class 11", subject: "Physics", title: "Kinematics & Projectile Motion Maps", authors: "Visual Study Guides", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "5", progress: 10 },
  { type: "notebook", year: "Class 11", subject: "Chemistry", title: "Thermodynamics & Equilibrium", authors: "Coaching Notes", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "1", progress: 50 },
  { type: "items", year: "Class 12", subject: "Physics", title: "Electromagnetism Previous Board Papers", authors: "Past Years", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "8", progress: 100 },
  { type: "notebook", year: "Class 12", subject: "Math", title: "Calculus: Integration & Differentiation", authors: "Param's Notes", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "15", progress: 20 },
  { type: "canvases", year: "Class 12", subject: "Biology", title: "Human Reproduction Mindmaps", authors: "Bio Lab PDF", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "9", progress: 85 },
  { type: "items", year: "Prep", subject: "Exam Prep", title: "SAT Vocabulary Word List 4000", authors: "Kaplan Scans", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "4", progress: 15 },
  { type: "notebook", year: "Class 11", subject: "Economics", title: "Microeconomics Foundational Principles", authors: "School Lectures", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "6", progress: 60 },

  // Engineering 1st Year (Basic Sciences & Intro)
  { type: "items", year: "Engg Yr 1", subject: "Mathematics", title: "Engineering Mathematics I - Matrices & Series", authors: "Dr. B.S. Grewal", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "22", progress: 70 },
  { type: "canvases", year: "Engg Yr 1", subject: "Physics", title: "Quantum Physics & Wave Mechanics Formulas", authors: "Physics Dept", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "3", progress: 5 },
  { type: "notebook", year: "Engg Yr 1", subject: "Computer Science", title: "Intro to C Programming & Logic", authors: "Lab Notes", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "18", progress: 95 },
  { type: "items", year: "Engg Yr 1", subject: "Mech Engg", title: "Engineering Graphics & Drawing Sheets", authors: "CAD Portal", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "5", progress: 30 },

  // Engineering 2nd Year (Core Subjects Start)
  { type: "notebook", year: "Engg Yr 2", subject: "Computer Science", title: "Data Structures - Trees & Graphs", authors: "Param's Log", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "11", progress: 100 },
  { type: "canvases", year: "Engg Yr 2", subject: "Computer Science", title: "Algorithm Complexities (Big O) Sheet", authors: "Algorithm Team", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "6", progress: 40 },
  { type: "items", year: "Engg Yr 2", subject: "Electrical", title: "Network Analysis & Circuits", authors: "Prof. Ramesh PDF", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "13", progress: 80 },
  { type: "notebook", year: "Engg Yr 2", subject: "Mathematics", title: "Discrete Mathematics & Probability", authors: "Personal Notes", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "4", progress: 25 },
  { type: "items", year: "Engg Yr 2", subject: "Computer Science", title: "Digital Logic Design Text", authors: "Morris Mano Copy", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "2", progress: 10 },
  { type: "canvases", year: "Engg Yr 2", subject: "Electronics", title: "Electronic Devices & Transistors Map", authors: "Lab Handouts", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "7", progress: 50 },
  
  // Engineering 3rd Year (Advanced Core)
  { type: "notebook", year: "Engg Yr 3", subject: "Computer Science", title: "Database Management Systems (DBMS)", authors: "Lecture Transcript", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "14", progress: 90 },
  { type: "items", year: "Engg Yr 3", subject: "Computer Science", title: "Operating Systems - Deadlocks & Paging", authors: "Galvin Notes", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "20", progress: 65 },
  { type: "canvases", year: "Engg Yr 3", subject: "Computer Science", title: "Computer Networks OSI Model Map", authors: "Cisco Hub", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "9", progress: 100 },
  { type: "items", year: "Engg Yr 3", subject: "Mech Engg", title: "Fluid Mechanics & Heat Transfer", authors: "Mech Dept PPT", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "1", progress: 5 },
  { type: "notebook", year: "Engg Yr 3", subject: "Civil Engg", title: "Structural Analysis Concepts", authors: "Civil Notes", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "3", progress: 20 },
  { type: "canvases", year: "Engg Yr 3", subject: "Computer Science", title: "Software Engineering Agile Lifecycles", authors: "Agile Printout", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "5", progress: 55 },
  { type: "items", year: "Engg Yr 3", subject: "Electrical", title: "Control Systems Text", authors: "Ogata Summaries", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "8", progress: 35 },

  // Engineering 4th Year (Specializations & Projects)
  { type: "notebook", year: "Engg Yr 4", subject: "Computer Science", title: "Artificial Intelligence & Neural Nets", authors: "Param's AI Drafts", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "25", progress: 100 },
  { type: "items", year: "Engg Yr 4", subject: "Computer Science", title: "Machine Learning Stanford Slides", authors: "Andrew Ng Docs", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "40", progress: 45 },
  { type: "canvases", year: "Engg Yr 4", subject: "Computer Science", title: "Cloud Computing Architectures", authors: "AWS Architect Maps", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "12", progress: 80 },
  { type: "notebook", year: "Engg Yr 4", subject: "Cybersecurity", title: "Cryptography, RSA & Network Security", authors: "Security Lectures", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "16", progress: 15 },
  { type: "items", year: "Engg Yr 4", subject: "Electronics", title: "VLSI Design & Architecture", authors: "Tech Books", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "2", progress: 0 },
  { type: "notebook", year: "Final Yr", subject: "Project", title: "Final Year Project: Decentralized Notes", authors: "Param S.", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "50", progress: 95 },
  { type: "items", year: "Final Yr", subject: "Professional", title: "GRE Prep: Quantitative Aptitude", authors: "Manhattan Prep", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "10", progress: 25 },
  
  // Extra Topics (Job Prep, Advanced Skills, Adult Learning)
  { type: "notebook", year: "Adult/Pro", subject: "Software Dev", title: "React & Next.js Advanced Patterns", authors: "Dev Conference Notes", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "33", progress: 100 },
  { type: "canvases", year: "Adult/Pro", subject: "System Design", title: "System Design Interview Cheat Sheet", authors: "Interview Prep", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "45", progress: 70 },
  { type: "items", year: "Adult/Pro", subject: "Finance", title: "Personal Finances & Intro to Stocks", authors: "Blog Archives", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "7", progress: 40 },
  { type: "notebook", year: "Adult/Pro", subject: "Management", title: "Product Management Principles", authors: "MBA Evening Classes", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "1", progress: 5 },
  { type: "items", year: "Adult/Pro", subject: "Software Dev", title: "Docker & Kubernetes Handbook", authors: "DevOps PDFs", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "14", progress: 20 },
  { type: "canvases", year: "Adult/Pro", subject: "Design", title: "UX/UI Design Thinking Flowcharts", authors: "Figma Community", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "19", progress: 85 },
  { type: "notebook", year: "Adult/Pro", subject: "Psychology", title: "Cognitive Behavioral Psychology", authors: "Online Courses", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "8", progress: 100 },
  { type: "items", year: "Prep", subject: "Professional", title: "Resume Templates & Cover Letters", authors: "Career Services", color: "bg-[#ecd7c0]", borderColor: "border-[#dcc4a9]", stats: "22", progress: 10 },
  { type: "canvases", year: "Adult/Pro", subject: "Data Science", title: "Data Pipelines & ETL Architecture", authors: "Data Engineers", color: "bg-[#f2ccd8]", borderColor: "border-[#dec5cc]", stats: "11", progress: 75 },
  { type: "notebook", year: "Adult/Pro", subject: "Language", title: "Spanish A1 Grammar Rules", authors: "Language Tutor", color: "bg-[#d9f2c6]", borderColor: "border-[#c4e0ae]", stats: "4", progress: 10 },
  { type: "items", year: "Adult/Pro", subject: "Literature", title: "Classic Russian Literature Review", authors: "Book Club", color: "bg-[#eff1cc]", borderColor: "border-[#dddfb6]", stats: "0", progress: 0 },
  { type: "canvases", year: "Engg Yr 4", subject: "Electronics", title: "Embedded Systems Blueprints", authors: "Microcontroller PDF", color: "bg-[#d0cbf2]", borderColor: "border-[#b9b2e0]", stats: "6", progress: 30 }
];

const Library = () => {
  const [activeTab, setActiveTab] = useState("items");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fetch from DB (public for everyone); seed sample data if empty
  const { data: libraryCards = CARDS, isLoading } = useQuery({
    queryKey: ['library_materials'],
    queryFn: async () => {
      try {
        // Try to seed sample data if table is empty
        await seedLibraryIfEmpty(CARDS);
        const data = await getLibraryMaterials();
        return data.length > 0 ? data : CARDS;
      } catch {
        // If tables don't exist yet, fall back to static CARDS
        return CARDS;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 min — library rarely changes
  });


  // 1. First Tier Classifier: Filter by Notebook / Canvas / Item tab
  const tabFilteredCards = useMemo(() => {
    return libraryCards.filter((card: any) => card.type === activeTab);
  }, [activeTab, libraryCards]);

  // 2. Dynamic Keyword/Categorization Algorithm (Only for matching tab)
  const tagsData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    tabFilteredCards.forEach(card => {
      // Add explicitly defined subjects as primary categories
      counts[card.subject] = (counts[card.subject] || 0) + 1;
      
      // We can also extract keywords from the title
      const keywords = extractKeywords(card.title);
      keywords.forEach(word => {
         const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
         if (capitalized !== card.subject && !counts[capitalized]) {
            counts[capitalized] = 1;
         } else if (counts[capitalized]) {
            counts[capitalized]++;
         }
      });
    });

    return Object.entries(counts)
      .filter(([_, count]) => count >= 1)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tabFilteredCards]);

  // 3. Second Tier Filtration: Filter those cards by the active tag
  const fullyFilteredCards = useMemo(() => {
    if (!activeTag) return tabFilteredCards;
    
    return tabFilteredCards.filter(card => {
      if (card.subject === activeTag) return true;
      const titleKeywords = extractKeywords(card.title).map(w => w.toLowerCase());
      return titleKeywords.includes(activeTag.toLowerCase());
    });
  }, [tabFilteredCards, activeTag]);

  // To prevent stale tag selection on tab change:
  useMemo(() => { setActiveTag(null); }, [activeTab]);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="mb-8 max-w-4xl">
        <h1 className="text-5xl font-serif text-[#382618] flex items-center gap-4 mb-4 font-black">
          My Study Materials
          <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
             <PenSquare className="w-4 h-4 text-[#382618]/60" />
          </button>
        </h1>
        <p className="text-[#382618]/70 text-base font-medium leading-relaxed max-w-3xl">
          Your personal learning library. Upload PDFs, textbook chapters, or handwritten notes, and SuperrBook will organize them! We extract insights, generate flashcards, and help you study actively from your own school curriculum.
        </p>
      </div>

      {/* Folder Tabs System */}
      <div className="relative mb-6">
        <div className="flex gap-2 px-1 relative z-10 bottom-[-1px]">
          <button 
            onClick={() => setActiveTab("items")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold transition-colors ${
              activeTab === "items" 
                ? "bg-[#fcfbfa] text-[#382618] border-t border-l border-r border-[#e8dfd5]" 
                : "bg-[#f2ebdf] text-[#382618]/60 hover:bg-[#eae1d3] border-t border-l border-r border-transparent"
            }`}
          >
            <FileText className="w-4 h-4" /> Items
          </button>
          
          <button 
             onClick={() => setActiveTab("notebook")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold transition-colors ${
              activeTab === "notebook" 
                ? "bg-[#fcfbfa] text-[#382618] border-t border-l border-r border-[#e8dfd5]" 
                : "bg-[#f2ebdf] text-[#382618]/60 hover:bg-[#eae1d3] border-t border-l border-r border-transparent"
            }`}
          >
            <Book className="w-4 h-4" /> Notebooks
          </button>
          
          <button 
             onClick={() => setActiveTab("canvases")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl lg:rounded-tr-3xl lg:border-r-0 font-bold transition-colors ${
              activeTab === "canvases" 
                ? "bg-[#fcfbfa] text-[#382618] border-t border-l border-[#e8dfd5]" 
                : "bg-[#f2ebdf] text-[#382618]/60 hover:bg-[#eae1d3] border-t border-l border-transparent"
            }`}
          >
            <Layout className="w-4 h-4" /> Canvases
          </button>
        </div>
        <div className="h-px bg-[#e8dfd5] w-full" />
      </div>

      {/* Authors Filter Bar */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[#382618]/60 mb-3 px-1">Subjects & Tags</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
          {tagsData.map((tag, i) => {
            const isActive = activeTag === tag.name;
            return (
              <button 
                key={i} 
                onClick={() => setActiveTag(isActive ? null : tag.name)}
                className={`flex-shrink-0 flex items-center gap-2 text-sm font-semibold py-1.5 pl-4 pr-1.5 rounded-full transition-all border-2 btn-press ${
                  isActive 
                    ? "bg-[#fa7533] text-white border-[#fa7533]" 
                    : "bg-[#f4ebdf] hover:bg-[#eaddce] text-[#382618]/80 border-transparent"
                }`}
              >
                 {tag.name}
                 <span className={`font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full ${isActive ? "bg-white/20 text-white" : "bg-white/60 text-[#382618]/60"}`}>
                   {tag.count}
                 </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6 px-1 border-t border-[#e8dfd5] pt-6">
         <span className="font-bold text-[#382618] capitalize">{activeTab} ({fullyFilteredCards.length})</span>
         
         <button onClick={() => toast.success("Opening file upload dropzone...")} className="flex items-center gap-2 px-4 py-2 bg-[#fa7533] border border-[#fa7533] rounded-full text-sm font-bold text-white hover:bg-[#e8601c] transition-colors shadow-sm ml-auto btn-press">
           <Plus className="w-4 h-4" /> Add Material
         </button>
         
         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8dfd5] rounded-full text-sm font-bold text-[#382618] hover:bg-black/5 transition-colors shadow-sm ml-2 btn-press">
           <ArrowDownUp className="w-4 h-4" /> Recently accessed
         </button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {isLoading && (
          <div className="col-span-full py-12 text-center text-[#382618]/40 font-bold animate-pulse">
            Syncing library...
          </div>
        )}
        {!isLoading && fullyFilteredCards.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#382618]/40 font-bold">
            No items found matching the selected tag.
          </div>
        )}
        {!isLoading && fullyFilteredCards.map((card, i) => (
          <div key={i} className={`relative flex flex-col p-6 rounded-[1.5rem] border ${card.borderColor} ${card.color} shadow-sm group hover:-translate-y-1 transition-transform cursor-pointer overflow-hidden`}>
            
            {/* Top Tags */}
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <span className="bg-white/50 text-[#382618] text-xs font-bold px-2.5 py-1 rounded-md">{card.year}</span>
                 <span className="text-[#382618]/70 text-sm font-bold">{card.subject}</span>
               </div>
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/40 rounded-lg transition-all text-[#382618]" onClick={(e) => e.stopPropagation()}>
                     <MoreHorizontal className="w-5 h-5" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-48 bg-white rounded-xl border-[#e8dfd5] shadow-lg p-1">
                   <DropdownMenuItem onClick={() => toast.success(`Moved "${card.title}" to folder`)} className="font-medium focus:bg-orange-50 focus:text-[#fa7533] cursor-pointer rounded-lg"><FolderInput className="w-4 h-4 mr-2" /> Move to Folder</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => toast.success(`Downloaded "${card.title}"`)} className="font-medium focus:bg-orange-50 focus:text-[#fa7533] cursor-pointer rounded-lg"><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => toast.success(`Deleted "${card.title}"`)} className="font-medium text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-lg"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
            
            {/* Title & Author */}
            <h2 className="text-xl font-bold text-[#382618] leading-tight mb-3 pr-4">{card.title}</h2>
            <p className="text-sm font-medium text-[#382618]/70 leading-relaxed mb-6">{card.authors}</p>
            
            {/* Bottom Indicators */}
            <div className="mt-auto flex items-center justify-between pt-4 opacity-50 font-bold">
               <span className="flex items-center gap-2 text-sm text-[#382618]">
                  <div className="w-4 h-4 rounded-full bg-[#382618] flex items-end justify-start overflow-hidden">
                     {/* Mock pie indicator */}
                     <div className="w-2 h-2 bg-white/40" />
                  </div>
                  {card.stats}
               </span>
               <div className="relative w-5 h-5 rounded-full border-2 border-[#382618]">
                  {card.progress > 0 && <div className={`absolute inset-0 bg-[#382618] ${card.progress === 100 ? 'rounded-full' : 'rounded-br-full'} opacity-40`}></div>}
               </div>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
};

export default Library;
