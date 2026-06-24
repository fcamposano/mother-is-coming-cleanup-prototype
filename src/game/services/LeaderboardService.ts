const STORAGE_KEY = "trinis_room_leaderboard_v1";

export type LeaderboardEntry = {
  name: string;
  score: number;
  date: string;
};

const SEEDS: LeaderboardEntry[] = [
  { name: "Trini 🦜", score: 940, date: "Jun 1" },
  { name: "Claude 🤖", score: 880, date: "Jun 10" },
  { name: "Sofía ⭐", score: 810, date: "Jun 12" },
  { name: "Mom 👀", score: 760, date: "Jun 14" },
  { name: "Pablito 🎮", score: 700, date: "Jun 15" },
  { name: "Caro 🌸", score: 640, date: "Jun 17" },
  { name: "Tío Rafa 😅", score: 580, date: "Jun 18" },
  { name: "Vale 🎵", score: 510, date: "Jun 20" },
  { name: "Benja 🚀", score: 440, date: "Jun 21" },
  { name: "Luli 🐦", score: 360, date: "Jun 22" }
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LeaderboardEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...SEEDS];
}

export function qualifies(score: number): boolean {
  const board = getLeaderboard();
  return board.length < 10 || score > board[board.length - 1].score;
}

export function addEntry(name: string, score: number): { board: LeaderboardEntry[]; rank: number } {
  const board = getLeaderboard();
  const now = new Date();
  const entry: LeaderboardEntry = {
    name: name.trim() || "Anonymous",
    score,
    date: `${now.toLocaleString("default", { month: "short" })} ${now.getDate()}`
  };
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  const rank = top10.findIndex((e) => e === entry) + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  } catch {}
  return { board: top10, rank };
}
