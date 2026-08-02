import { useState, useEffect } from "react";
import { User, Bell, Shield, Moon, Monitor, Sun, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Populate form with real profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: displayName,
        });

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Please contact support to delete your account.");
  };

  const handleDownloadData = () => {
    const data = {
      user_id: user?.id,
      email: user?.email,
      full_name: profile?.full_name,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "superrbook-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-3xl mx-auto w-full pb-10 overflow-y-auto scrollbar-hide">
      
      <div className="mb-8">
         <h1 className="text-4xl font-black text-[#382618]">Settings</h1>
         <p className="font-handwritten text-[#fa7533] text-xl mt-1">make it yours.</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile Details section */}
        <section className="bg-white border-2 border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
             <User className="w-5 h-5 text-[#fa7533]" />
             <h2 className="text-xl font-bold text-[#382618]">Profile Details</h2>
          </div>
          
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Display Name</label>
                 <input
                   type="text"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   placeholder="Your name"
                   className="w-full bg-muted/20 border-2 border-border/60 rounded-xl py-3 px-4 font-bold text-[#382618] focus:border-[#fa7533] transition-colors outline-none"
                 />
              </div>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Class / Grade</label>
                 <input
                   type="text"
                   value={grade}
                   onChange={(e) => setGrade(e.target.value)}
                   placeholder="e.g. Class 10 / Year 2"
                   className="w-full bg-muted/20 border-2 border-border/60 rounded-xl py-3 px-4 font-bold text-[#382618] focus:border-[#fa7533] transition-colors outline-none"
                 />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Email Address</label>
                 <input
                   type="email"
                   value={user?.email || ""}
                   disabled
                   className="w-full bg-muted/40 border-2 border-border/40 rounded-xl py-3 px-4 font-bold text-[#382618]/50 cursor-not-allowed"
                 />
                 <p className="text-xs font-medium text-muted-foreground px-1 mt-1">Email is managed by your sign-in provider.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
               <button
                 type="submit"
                 disabled={isSaving}
                 className="bg-[#382618] text-white font-bold py-2.5 px-6 rounded-xl shadow-sm hover:bg-black transition-colors active:scale-95 flex items-center gap-2 disabled:opacity-60"
               >
                 {isSaving ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                 ) : (
                   <><Save className="w-4 h-4" /> Save Changes</>
                 )}
               </button>
            </div>
          </form>
        </section>

        {/* Appearance section */}
        <section className="bg-white border-2 border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
             <Monitor className="w-5 h-5 text-[#fa7533]" />
             <h2 className="text-xl font-bold text-[#382618]">Appearance</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             {[
               { id: "light", icon: Sun, label: "Light" },
               { id: "dark", icon: Moon, label: "Dark" },
               { id: "system", icon: Monitor, label: "System" }
             ].map(t => (
               <button 
                 key={t.id}
                 onClick={() => setTheme(t.id)}
                 className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                   theme === t.id 
                     ? "border-[#fa7533] bg-[#fa7533]/5 text-[#fa7533]" 
                     : "border-border/60 hover:bg-muted/20 text-muted-foreground font-medium"
                 }`}
               >
                 <t.icon className="w-6 h-6 mb-2" />
                 <span className="font-bold text-sm tracking-wide">{t.label}</span>
               </button>
             ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white border-2 border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
             <Bell className="w-5 h-5 text-[#fa7533]" />
             <h2 className="text-xl font-bold text-[#382618]">Notifications</h2>
          </div>
          
          <div className="space-y-4">
             {[
               { title: "Study Reminders", desc: "Get gently reminded to complete your active recall quizzes." },
               { title: "Community Mentions", desc: "When someone replies to or shares your mind map." },
               { title: "Weekly Report", desc: "A summary of what you learned this week." }
             ].map((n, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-[#382618]">{n.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{n.desc}</p>
                  </div>
                  {/* Mock Toggle */}
                  <div className="w-12 h-6 bg-[#fa7533] rounded-full relative cursor-pointer shadow-inner">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Safety & Privacy */}
        <section className="bg-white/50 border-2 border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4 text-[#382618]">
             <Shield className="w-5 h-5" />
             <h2 className="text-xl font-bold">Privacy Center</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
             Your study data is encrypted entirely on your device. We do not use your personal entries to train public AI models. 
             If you wish to export your study boards or delete your account, you can do so below.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadData}
              className="bg-white border-2 border-border/80 text-[#382618] font-bold py-2.5 px-6 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
            >
              Download Data
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-50 text-red-600 font-bold py-2.5 px-6 rounded-xl hover:bg-red-100 transition-colors active:scale-95 border border-red-200"
            >
              Delete Account
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
