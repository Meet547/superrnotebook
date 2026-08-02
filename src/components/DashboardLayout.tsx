import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, FileQuestion, Users, Settings as SettingsIcon, LogOut, PanelLeftClose, PanelLeft, Library, Plus, User } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "Chat & Notes", icon: MessageSquare, href: "/main/chat" },
  { label: "Active Recall", icon: FileQuestion, href: "/main/quiz" },
  { label: "Community", icon: Users, href: "/main/community" },
  { label: "Library", icon: Library, href: "/main/library" },
];

const DashboardLayout = () => {
  const { logout, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'You';
  const displayEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex bg-[#fcfbfa] min-h-screen text-foreground font-body relative overflow-hidden">
      {/* Background Grid Pattern (Inherited but explicit here for safety) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}></div>

      {/* Sidebar Capsule */}
      <aside 
        className={`m-4 md:m-6 h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[2.5rem] bg-[#f4efe8] flex flex-col transition-all duration-300 z-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e8dfd5] ${
          isCollapsed ? "w-[90px] items-center px-0" : "w-72 px-4"
        }`}
      >
        {/* Toggle / Logo Area */}
        <div className={`w-full pt-8 pb-6 flex ${isCollapsed ? 'justify-center' : 'justify-between items-center px-2'}`}>
           {!isCollapsed && (
             <Link to="/" className="text-2xl font-black tracking-tighter text-[#382618]">
                superrbook<span className="text-[#fa7533] font-handwritten text-3xl">.</span>
             </Link>
           )}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="w-12 h-12 flex items-center justify-center text-[#382618] hover:bg-black/5 rounded-full transition-colors"
             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {isCollapsed ? <PanelLeft className="w-6 h-6" /> : <PanelLeftClose className="w-6 h-6" />}
           </button>
        </div>

        {/* Main Nav Items */}
        <div className={`flex flex-col gap-4 w-full ${isCollapsed ? 'items-center' : 'px-2'}`}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center transition-all duration-300 ${
                  isCollapsed ? "justify-center w-14 h-14 rounded-full" : "w-full h-14 rounded-full px-5 gap-4"
                } ${
                  isActive 
                    ? "bg-[#fa7533] text-white shadow-md shadow-[#fa7533]/20" 
                    : "bg-white text-[#382618] shadow-sm hover:bg-white/60"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#382618]'}`} />
                {!isCollapsed && <span className="font-bold text-base">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Spacer for collapsed state */}
        <div className="flex-1"></div>

        {/* Bottom User Area */}
        <div className={`mt-auto pb-8 flex flex-col gap-4 w-full ${isCollapsed ? 'items-center' : 'px-2 pt-4 border-t border-[#e8dfd5]'}`}>
          
          <Link
            to="/main/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={`flex items-center transition-all duration-300 ${
              isCollapsed ? "justify-center w-14 h-14 rounded-full" : "w-full h-14 rounded-full px-5 gap-4"
            } ${
              location.pathname.includes('/settings')
                ? "bg-[#fa7533] text-white shadow-md shadow-[#fa7533]/20" 
                : "bg-white text-[#382618] shadow-sm hover:bg-white/60"
            }`}
          >
            <SettingsIcon className={`w-6 h-6 ${location.pathname.includes('/settings') ? 'text-white' : 'text-[#382618]'}`} />
            {!isCollapsed && <span className="font-bold text-base">Settings</span>}
          </Link>

          {/* User Avatar mimicking image */}
          <div className={`cursor-pointer flex items-center transition-all duration-300 ${
              isCollapsed ? "justify-center w-14 h-14 rounded-full bg-[#eaddce] shadow-inner border border-[#d6c7b6]" : "w-full h-14 rounded-full px-2 gap-4 bg-[#eaddce]/50 hover:bg-[#eaddce] border border-transparent hover:border-[#d6c7b6]"
            }`}>
             <div className="w-10 h-10 rounded-full bg-[#382618] flex items-center justify-center text-white font-bold text-sm">
                {avatarLetter || <User className="w-5 h-5" />}
             </div>
             {!isCollapsed && (
               <div className="flex-1 flex items-center justify-between pr-2 min-w-0">
                 <div className="min-w-0">
                   <p className="font-bold text-sm text-[#382618] leading-tight truncate">{displayName}</p>
                   <p className="text-xs font-medium text-[#382618]/50 truncate">{displayEmail}</p>
                 </div>
                 <button onClick={logout} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors flex-shrink-0" title="Logout">
                    <LogOut className="w-4 h-4" />
                 </button>
               </div>
             )}
          </div>
          
          {/* Logout button (only if collapsed, as expanded shows it in avatar row) */}
          {isCollapsed && (
             <button
               onClick={logout}
               title="Logout"
               className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 shadow-sm hover:bg-red-100 transition-colors"
             >
               <LogOut className="w-5 h-5" />
             </button>
          )}

        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col relative w-full h-screen overflow-hidden z-10">
        
        {/* Top Header / Breadcrumb Area */}
        <header className="h-14 flex items-center px-4 md:px-6 bg-transparent z-20 shrink-0 border-b border-black/5 mt-2">
           {/* Very simple dynamic Breadcrumb title based on path */}
           <h2 className="text-xl font-bold text-[#382618]/60 capitalize flex items-center gap-2">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
           </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-2 md:p-4 w-full h-full">
           <Outlet />
        </div>

        {/* Global Action FAB */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-[#fa7533] text-white rounded-full shadow-[0_8px_30px_rgb(250,117,51,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50">
              <Plus className="w-8 h-8" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2 mr-2 bg-white rounded-2xl p-2 border-[#e8dfd5] shadow-xl">
            <DropdownMenuLabel className="font-bold text-[#382618]">Create New</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#e8dfd5]" />
            <DropdownMenuItem className="cursor-pointer font-medium text-[#382618] hover:text-[#fa7533] hover:bg-orange-50 focus:bg-orange-50 rounded-xl" onClick={() => navigate('/main/chat')}>
              <MessageSquare className="w-4 h-4 mr-2" /> Note / Chat
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-medium text-[#382618] hover:text-[#fa7533] hover:bg-orange-50 focus:bg-orange-50 rounded-xl" onClick={() => navigate('/main/quiz')}>
              <FileQuestion className="w-4 h-4 mr-2" /> Flashcards / Quiz
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-medium text-[#382618] hover:text-[#fa7533] hover:bg-orange-50 focus:bg-orange-50 rounded-xl" onClick={() => navigate('/main/library')}>
              <Library className="w-4 h-4 mr-2" /> Browse Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </main>
    </div>
  );
};

export default DashboardLayout;
