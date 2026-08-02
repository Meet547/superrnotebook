import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WaitlistModalProps {
  children: React.ReactNode;
}

const WaitlistModal = ({ children }: WaitlistModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address!");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.toLowerCase().trim(),
        role: role || null,
      });

      if (error) {
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          toast.info("You're already on the list! We'll notify you when SuperrBook launches. 🎉");
          setOpen(false);
          setEmail("");
          setRole("");
          return;
        }
        throw error;
      }

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setRole("");
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#fdfaf5] border-[#e8dfd5] font-body rounded-[24px]">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-8 gap-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="font-handwritten text-3xl text-[#382618] mb-2">You're on the list! 🎉</h2>
              <p className="text-foreground/70 font-medium text-base">
                We'll notify <strong>{email}</strong> the moment SuperrBook goes live!
              </p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="bg-[#fa7533] hover:bg-[#e8601c] text-white font-bold h-12 px-8 rounded-xl"
            >
              Awesome, close!
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-handwritten text-4xl text-[#382618]">Join the waitlist</DialogTitle>
              <DialogDescription className="text-foreground/70 font-medium text-base">
                Be the first to know when SuperrBook drops. Spots are limited!
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="waitlist-email" className="block text-sm font-bold text-[#382618] mb-1.5">Email Address</label>
                  <Input 
                    id="waitlist-email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="bg-white border-[#e8dfd5] focus-visible:ring-[#fa7533] h-12 rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#382618] mb-1.5">I am a...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Student', 'Parent', 'Teacher'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                          role === r 
                            ? 'bg-[#fa7533] text-white border-[#fa7533] shadow-md shadow-[#fa7533]/20 scale-[1.02]' 
                            : 'bg-white text-[#382618] hover:border-[#fa7533]/50 border-[#e8dfd5]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#fa7533] hover:bg-[#e8601c] text-white text-lg font-bold h-14 rounded-xl shadow-md btn-press"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving your spot...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Join Waitlist</>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
