import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Fetch profile, and if it doesn't exist yet (existing user before trigger was added),
   * upsert it so that FK constraints on chat_sessions and community_posts never fail.
   */
  const fetchOrCreateProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        return;
      }

      // Profile row missing — create it now (handles existing users & trigger gaps)
      const displayName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "User";

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: authUser.id,
            email: authUser.email!,
            full_name: displayName,
            avatar_url: authUser.user_metadata?.avatar_url ?? null,
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (!insertError && newProfile) {
        setProfile(newProfile as Profile);
      } else {
        console.warn("Could not upsert profile:", insertError?.message);
      }
    } catch (e) {
      console.warn("Could not fetch/create profile:", e);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchOrCreateProfile(user);
  };

  useEffect(() => {
    let lastUserId: string | undefined;

    // Single call — getSession() returns user too, no second round-trip needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        lastUserId = session.user.id;
        fetchOrCreateProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth state changes (login, logout, token refresh, magic link redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Skip profile re-fetch on token refresh events (userId unchanged)
        if (session.user.id !== lastUserId) {
          lastUserId = session.user.id;
          await fetchOrCreateProfile(session.user);
        }
      } else {
        lastUserId = undefined;
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/main`,
      },
    });
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/main`,
      },
    });
    return { error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/main`,
      },
    });
    return { error };
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        profile,
        session,
        isLoading,
        logout,
        signInWithGoogle,
        signInWithOtp,
        signInWithPassword,
        signUpWithPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
