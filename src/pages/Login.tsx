import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, Eye, EyeOff, Lock, ArrowRight } from "lucide-react";

type Tab = "signup" | "login";
type SignupStep = "idle" | "loading" | "sent";
type LoginStep = "idle" | "loading";

const Login = () => {
  const [tab, setTab] = useState<Tab>("signup");

  // Sign Up state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("idle");

  // Log In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("idle");

  const { signInWithGoogle, signInWithOtp, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  /* ── Google (shared) ────────────────────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  /* ── Sign Up (email + password) ────────────────────────────────────────── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) return;
    setSignupStep("loading");
    const { error } = await signUpWithPassword(signupEmail, signupPassword);
    if (error) {
      toast.error(error.message || "Sign up failed. Try again.");
      setSignupStep("idle");
    } else {
      setSignupStep("sent");
    }
  };

  /* ── Log In (email + password) ──────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginStep("loading");
    const { error } = await signInWithPassword(loginEmail, loginPassword);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "Wrong email or password. Check and try again."
          : error.message || "Login failed. Please try again."
      );
      setLoginStep("idle");
    } else {
      toast.success("Welcome back! 🎉");
      navigate("/main");
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-background">
      {/* Left: Illustration/hero */}
      <div className="hidden sm:flex flex-1 items-center justify-center bg-gradient-to-br from-[#fdf6e3] to-[#ffe7c2] p-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative flex items-center justify-center w-full h-full" style={{ maxWidth: 540, maxHeight: 600 }}>
            <img
              src="/login-hero.png"
              alt="SuperrBook Hero"
              className="object-cover w-full h-full rounded-[2.5rem] shadow-2xl border border-[#f7e7d1]"
              style={{ maxWidth: 540, maxHeight: 600 }}
            />
            {/* Matte overlay for premium look */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-white/40 backdrop-blur-[2px] pointer-events-none" style={{mixBlendMode: 'multiply'}} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 flex flex-col items-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg flex flex-col items-center w-full max-w-[90%] mx-auto">
              <span className="font-handwritten text-xl text-[#fa7533] mb-1">superrbook</span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#382618] mb-2 text-center">Your AI-powered learning companion.</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth card */}
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background px-4 py-8">
        <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl border border-[#f7e7d1] p-8 md:p-12 flex flex-col items-center">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-[#382618] mb-2 tracking-tight">superrbook</h1>
          <p className="text-muted-foreground mb-8 text-base">Your AI-powered learning companion.</p>

          <div className="w-full flex flex-col gap-4">
            <div className="flex rounded-xl bg-[#fdf6e3] p-1 border border-[#fa7533]/20 mb-4">
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 text-base font-bold rounded-lg transition-all duration-200 ${tab === "signup" ? "bg-white text-[#fa7533] shadow" : "text-[#382618]/60 hover:text-[#382618]"}`}
              >
                Sign up
              </button>
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-2 text-base font-bold rounded-lg transition-all duration-200 ${tab === "login" ? "bg-white text-[#fa7533] shadow" : "text-[#382618]/60 hover:text-[#382618]"}`}
              >
                Log in
              </button>
            </div>

            {tab === "signup" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 text-base font-semibold rounded-xl border-[#fa7533]/40 hover:bg-[#fa7533]/10 transition-colors shadow-sm"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign up with Google
                </Button>
                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-[#fa7533]/20" />
                  <span className="mx-3 text-xs text-[#382618]/40">or</span>
                  <div className="flex-1 h-px bg-[#fa7533]/20" />
                </div>
                {signupStep === "sent" ? (
                  <div className="flex flex-col items-center text-center space-y-6 py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Account created!</h2>
                      <p className="text-base text-muted-foreground leading-relaxed">Welcome to SuperrBook, <strong>{signupEmail}</strong>.<br />You can now log in with your email and password.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-border/60" onClick={() => { setSignupStep("idle"); setSignupEmail(""); setSignupPassword(""); }}>Sign up with a different email</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="py-4 rounded-xl border-border/60 bg-muted/20 px-4 text-base focus-visible:ring-primary shadow-sm"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <div className="relative">
                      <Input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="py-4 rounded-xl border-border/60 bg-muted/20 px-4 pr-12 text-base focus-visible:ring-primary shadow-sm"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={signupStep === "loading"}
                      className="w-full py-3 text-base font-bold rounded-xl shadow-md bg-[#fa7533] text-white hover:bg-[#e8601c] transition-all active:scale-[0.98]"
                    >
                      {signupStep === "loading" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>) : (<><Mail className="mr-2 h-4 w-4" /> Sign Up</>)}
                    </Button>
                  </form>
                )}
                <p className="text-center text-xs text-muted-foreground leading-relaxed mt-4">Already have an account? <button onClick={() => setTab("login")} className="underline underline-offset-4 hover:text-primary font-semibold transition-colors">Log in instead</button></p>
                <p className="text-center text-xs text-muted-foreground leading-relaxed mt-2">By signing up you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a> and <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>.</p>
              </>
            )}

            {tab === "login" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 text-base font-semibold rounded-xl border-[#fa7533]/40 hover:bg-[#fa7533]/10 transition-colors shadow-sm"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Log in
                </Button>
                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-[#fa7533]/20" />
                  <span className="mx-3 text-xs text-[#382618]/40">or</span>
                  <div className="flex-1 h-px bg-[#fa7533]/20" />
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="py-4 rounded-xl border-border/60 bg-muted/20 px-4 text-base focus-visible:ring-primary shadow-sm"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      className="py-4 rounded-xl border-border/60 bg-muted/20 px-4 pr-12 text-base focus-visible:ring-primary shadow-sm"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={loginStep === "loading"}
                    className="w-full py-3 text-base font-bold rounded-xl shadow-md bg-[#fa7533] text-white hover:bg-[#e8601c] transition-all active:scale-[0.98]"
                  >
                    {loginStep === "loading" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>) : (<><Lock className="mr-2 h-4 w-4" /> Log In <ArrowRight className="ml-1 h-4 w-4" /></>)}
                  </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground leading-relaxed mt-4">Forgot your password? <button type="button" onClick={() => { setTab("signup"); }} className="underline underline-offset-4 hover:text-primary font-semibold transition-colors">Get a magic link instead</button></p>
                <p className="text-center text-xs text-muted-foreground leading-relaxed mt-2">Don't have an account yet? <button onClick={() => setTab("signup")} className="underline underline-offset-4 hover:text-primary font-semibold transition-colors">Sign up free</button></p>
              </>
            )}
          </div>
        </div>
        <footer className="mt-8 text-xs text-muted-foreground text-center opacity-80">
          By signing up you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a> and <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>.<br />
          <span className="mt-2 block">by SuperrBook</span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
