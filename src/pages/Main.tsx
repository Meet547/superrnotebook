import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background">
      <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
        <Button variant="outline" onClick={handleLogout} className="border-border/50 shadow-sm hover:shadow-md transition-all">
          Logout
        </Button>
      </div>

      <div className="container max-w-2xl text-center space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
        <div className="space-y-4">
          <p className="font-handwritten text-primary text-2xl rotate-[-2deg] opacity-90 inline-block mr-2">Welcome inside,</p>
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            SuperrBook Main Page
          </h1>
          <p className="text-muted-foreground text-lg">
            This area is currently under construction. Check back later!
          </p>
        </div>

        <div className="relative p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-xl mt-12 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <svg className="w-16 h-16 mx-auto mb-6 text-primary/40 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <div className="space-y-3 font-handwritten text-xl text-center">
            <p className="text-foreground/80">More magic is being crafted...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
