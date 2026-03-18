import type { Player } from "@prisma/client";

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateRandomSinglesMatch(players: Player[]): [Player, Player] | null {
  if (players.length < 2) return null;
  const shuffled = shuffleArray(players);
  return [shuffled[0], shuffled[1]];
}

export function generateRandomDoublesMatch(
  players: Player[]
): [[Player, Player], [Player, Player]] | null {
  if (players.length < 4) return null;
  const shuffled = shuffleArray(players);
  return [
    [shuffled[0], shuffled[1]],
    [shuffled[2], shuffled[3]],
  ];
}

export type DoublesTeamStats = {
  playerIds: [string, string];
  playerNames: [string, string];
  played: number;
  won: number;
  winRate: number;
};
