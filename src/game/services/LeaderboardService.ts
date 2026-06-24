import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xbnbwdghdlwumuzylkkn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJ3ZGdoZGx3dW11enlsa2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODYwNzAsImV4cCI6MjA5NDE2MjA3MH0.TJjAunrxeCBkAq3w47vAeqcfwiaeP2xvvdB-Y78TtFs";
const GAME_ID = "trinis-room";
const TOP_N = 10;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type LeaderboardEntry = {
  name: string;
  score: number;
  date: string;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("game_leaderboard")
    .select("name, score, created_at")
    .eq("game_id", GAME_ID)
    .order("score", { ascending: false })
    .limit(TOP_N);

  if (error || !data) return SEEDS;

  return data.map((row) => ({
    name: row.name,
    score: row.score,
    date: formatDate(row.created_at)
  }));
}

export async function qualifies(score: number): Promise<boolean> {
  const board = await getLeaderboard();
  return board.length < TOP_N || score > board[board.length - 1].score;
}

export async function addEntry(
  name: string,
  score: number
): Promise<{ board: LeaderboardEntry[]; rank: number }> {
  const trimmed = name.trim() || "Anonymous";

  await supabase.from("game_leaderboard").insert({
    game_id: GAME_ID,
    name: trimmed,
    score
  });

  const board = await getLeaderboard();
  const rank = board.findIndex((e) => e.name === trimmed && e.score === score) + 1;
  return { board, rank: rank > 0 ? rank : TOP_N };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
}

const SEEDS: LeaderboardEntry[] = [];
