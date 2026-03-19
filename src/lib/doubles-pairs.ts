import type { DoublesTeam, DoublesTeamPlayer, Player, Set } from "@prisma/client";
import { getMatchWinner } from "./stats";

/** Generate random doubles pairs from an even-sized player pool. */
export function generateRandomPairs(playerIds: string[]): [string, string][] {
  if (playerIds.length % 2 !== 0) throw new Error("Need an even number of players for random pairs");
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  const pairs: [string, string][] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }
  return pairs;
}

export type PairStandingsRow = {
  teamId: string;
  playerIds: [string, string];
  playerNames: [string, string];
  avatarColors: [string, string];
  played: number;
  won: number;
  lost: number;
  leaguePoints: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  form: ("W" | "L")[];
};

type MatchForStandings = {
  status: string;
  type: string;
  team1Id: string | null;
  team2Id: string | null;
  sets: Pick<Set, "score1" | "score2">[];
};

type TeamWithPlayers = DoublesTeam & {
  players: (DoublesTeamPlayer & { player: Pick<Player, "id" | "name" | "avatarColor"> })[];
};

export function computeDoublesPairStandings(
  teams: TeamWithPlayers[],
  matches: MatchForStandings[]
): PairStandingsRow[] {
  const stats: Record<string, PairStandingsRow> = {};

  for (const team of teams) {
    const sorted = [...team.players].sort((a, b) =>
      a.player.name.localeCompare(b.player.name)
    );
    const [a, b] = sorted;
    stats[team.id] = {
      teamId: team.id,
      playerIds: [a.player.id, b.player.id],
      playerNames: [a.player.name, b.player.name],
      avatarColors: [a.player.avatarColor, b.player.avatarColor],
      played: 0, won: 0, lost: 0,
      leaguePoints: 0,
      setsWon: 0, setsLost: 0,
      pointsFor: 0, pointsAgainst: 0,
      form: [],
    };
  }

  for (const m of matches) {
    if (m.status !== "COMPLETED" || m.type !== "DOUBLES") continue;
    if (!m.team1Id || !m.team2Id || m.sets.length === 0) continue;
    if (!stats[m.team1Id] || !stats[m.team2Id]) continue;

    const winner = getMatchWinner(m.sets as any);
    if (winner === 0) continue;

    const pf1 = m.sets.reduce((s, r) => s + r.score1, 0);
    const pf2 = m.sets.reduce((s, r) => s + r.score2, 0);
    const sw1 = m.sets.filter((s) => s.score1 > s.score2).length;
    const sw2 = m.sets.filter((s) => s.score2 > s.score1).length;

    // team1
    const t1 = stats[m.team1Id];
    t1.played++;
    t1.pointsFor += pf1;
    t1.pointsAgainst += pf2;
    t1.setsWon += sw1;
    t1.setsLost += sw2;
    if (winner === 1) {
      t1.won++;
      t1.leaguePoints += 2;
      t1.form = ([...t1.form, "W"] as ("W" | "L")[]).slice(-5);
    } else {
      t1.lost++;
      t1.form = ([...t1.form, "L"] as ("W" | "L")[]).slice(-5);
    }

    // team2
    const t2 = stats[m.team2Id];
    t2.played++;
    t2.pointsFor += pf2;
    t2.pointsAgainst += pf1;
    t2.setsWon += sw2;
    t2.setsLost += sw1;
    if (winner === 2) {
      t2.won++;
      t2.leaguePoints += 2;
      t2.form = ([...t2.form, "W"] as ("W" | "L")[]).slice(-5);
    } else {
      t2.lost++;
      t2.form = ([...t2.form, "L"] as ("W" | "L")[]).slice(-5);
    }
  }

  return Object.values(stats).sort((a, b) => {
    if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
    return (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
  });
}
