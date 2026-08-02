/**
 * api.ts — SuperrBook Backend Service Layer
 * All Supabase database operations are centralised here.
 * Import from "@/lib/api" in components.
 */

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  score: string;
  active: boolean;
  color: string;
  border: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  name: string;
  handle: string;
  avatar: string;
  text: string;
  board_label: string;
  time: string;
  likes: number;
  replies: number;
  rotation: string;
  tape_rotate: string;
  paper_color: string;
  created_at: string;
}

export interface LibraryMaterial {
  id: string;
  type: "notebook" | "items" | "canvases";
  year: string;
  subject: string;
  title: string;
  authors: string;
  color: string;
  border_color: string;
  borderColor: string;
  stats: string;
  progress: number;
}

// ─────────────────────────────────────────────
// CHAT SESSIONS
// ─────────────────────────────────────────────

/** Fetch all chat sessions for the current user, newest first */
export async function getChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Create a new blank chat session. Pass userId from AuthContext to avoid an extra network round-trip. */
export async function createChatSession(title = "New Note", userId?: string): Promise<ChatSession> {
  let uid = userId;
  if (!uid) {
    // Fallback: read from cached session (no network call needed in most cases)
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: uid, title })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Rename a chat session */
export async function renameChatSession(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Delete a chat session and all its messages */
export async function deleteChatSession(id: string): Promise<void> {
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// CHAT MESSAGES
// ─────────────────────────────────────────────

/** Fetch all messages in a session */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Append a message to a session and bump updated_at on the session */
export async function sendMessage(
  sessionId: string,
  role: "user" | "ai",
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role, content })
    .select()
    .single();

  if (error) throw error;

  // Bump session updated_at so it floats to the top of history
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return data;
}

// ─────────────────────────────────────────────
// QUIZZES (per-user)
// ─────────────────────────────────────────────

/** Fetch all quizzes owned by current user */
export async function getUserQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Create a new quiz for the current user. Pass userId from AuthContext to avoid an extra network round-trip. */
export async function createQuiz(
  subject: string,
  topic: string,
  color = "bg-violet-100/50",
  border = "border-violet-200",
  userId?: string
): Promise<Quiz> {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quizzes")
    .insert({ user_id: uid, subject, topic, score: "Pending", active: true, color, border })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update quiz score */
export async function updateQuizScore(id: string, score: string): Promise<void> {
  const { error } = await supabase.from("quizzes").update({ score, active: false }).eq("id", id);
  if (error) throw error;
}

/** Delete a quiz */
export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// COMMUNITY POSTS (public feed)
// ─────────────────────────────────────────────

/** Fetch all community posts, newest first */
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Create a new community post for the current user */
export async function createCommunityPost(
  text: string,
  boardLabel: string,
  displayName: string,
  handle: string,
  avatarLetter: string,
  userId?: string
): Promise<CommunityPost> {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) throw new Error("Not authenticated");
  const user = { id: uid };

  const PAPER_COLORS = ["bg-white", "bg-[#fffce8]", "bg-[#fdf8b5]", "bg-[#fff5f5]", "bg-[#f0fff4]"];
  const ROTATIONS = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-0"];
  const TAPE_ROTATES = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", "rotate-3"];
  const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      name: displayName,
      handle,
      avatar: avatarLetter,
      text,
      board_label: boardLabel,
      time: "just now",
      likes: 0,
      replies: 0,
      rotation: rand(ROTATIONS),
      tape_rotate: rand(TAPE_ROTATES),
      paper_color: rand(PAPER_COLORS),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Like a post (increment likes) */
export async function likePost(id: string, currentLikes: number): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .update({ likes: currentLikes + 1 })
    .eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// LIBRARY (global / shared for all users)
// ─────────────────────────────────────────────

/** Fetch all library materials (public for everyone) */
export async function getLibraryMaterials(): Promise<LibraryMaterial[]> {
  const { data, error } = await supabase
    .from("library_materials")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return data.map((row: any) => ({
    ...row,
    borderColor: row.borderColor ?? row.border_color ?? "border-[#c4e0ae]",
  }));
}

/** Seed the shared sample library (run once — checks before inserting) */
export async function seedLibraryIfEmpty(cards: any[]): Promise<void> {
  const { count } = await supabase
    .from("library_materials")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) return; // already seeded

  // Insert all sample cards without user_id (shared library)
  const rows = cards.map(({ borderColor, ...card }: any) => ({
    ...card,
    border_color: borderColor,
    user_id: null, // nullable in updated schema
  }));

  const { error } = await supabase.from("library_materials").insert(rows);
  if (error) console.warn("Library seed warning:", error.message);
}

// ─────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────

export async function joinWaitlist(email: string, role?: string): Promise<void> {
  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase().trim(),
    role: role ?? null,
  });

  if (error) {
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      throw new Error("DUPLICATE");
    }
    throw error;
  }
}
