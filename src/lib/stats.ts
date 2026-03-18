import type { Match, Set, Player, DoublesTeam, DoublesTeamPlayer } from "@prisma/client";

export type MatchWithSets = Match & {
  sets: Set[];
  player1: Player | null;
  player2: Player | null;
  team1: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
  team2: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
  referee?: Player | null;
};

export type PlayerStats = {
  playerId: string;
  name: string;
  avatarColor: string;
  emoji?: string | null;
  played: number;
  won: number;
  lost: number;
  winRate: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
  streak: number;
  form: ("W" | "L")[];
};

export type StandingsRow = PlayerStats & {
  leaguePoints: number;
  drawn: number;
};

export type RotatingDoublesStandingsRow = {
  playerId: string;
  name: string;
  avatarColor: string;
  emoji?: string | null;
  played: number;
  won: number;
  lost: number;
  leaguePoints: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  refCount: number;
  form: ("W" | "L")[];
  winRate: number;
};

/** Derive which side won a match (1 = player1/team1, 2 = player2/team2, 0 = incomplete) */
export function getMatchWinner(sets: Set[]): 0 | 1 | 2 {
  if (sets.length === 0) return 0;
  let wins1 = 0;
  let wins2 = 0;
  for (const s of sets) {
    if (s.score1 > s.score2) wins1++;
    else if (s.score2 > s.score1) wins2++;
  }
  if (wins1 > wins2) return 1;
  if (wins2 > wins1) return 2;
  return 0;
}

export function computePlayerStats(
  playerId: string,
  name: string,
  avatarColor: string,
  matches: MatchWithSets[],
  emoji?: string | null
): PlayerStats {
  const playerMatches = matches.filter(
    (m) =>
      m.status === "COMPLETED" &&
      m.type === "SINGLES" &&
      (m.player1Id === playerId || m.player2Id === playerId)
  );

  let won = 0;
  let lost = 0;
  let setsWon = 0;
  let setsLost = 0;
  let pointsWon = 0;
  let pointsLost = 0;
  const results: ("W" | "L")[] = [];

  for (const m of playerMatches) {
    const side = m.player1Id === playerId ? 1 : 2;
    const winner = getMatchWinner(m.sets);
    for (const s of m.sets) {
      const mySc = side === 1 ? s.score1 : s.score2;
      const oppSc = side === 1 ? s.score2 : s.score1;
      if (mySc > oppSc) setsWon++;
      else setsLost++;
      pointsWon += mySc;
      pointsLost += oppSc;
    }
    if (winner === side) { won++; results.push("W"); }
    else if (winner !== 0) { lost++; results.push("L"); }
  }

  const form = results.slice(-5).reverse();
  let streak = 0;
  if (results.length > 0) {
    const last = results[results.length - 1];
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === last) streak++;
      else break;
    }
    if (last === "L") streak = -streak;
  }

  return {
    playerId, name, avatarColor, emoji,
    played: won + lost, won, lost,
    winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0,
    setsWon, setsLost, pointsWon, pointsLost, streak, form,
  };
}

export function computeLeagueStandings(
  players: Player[],
  matches: MatchWithSets[]
): StandingsRow[] {
  return players
    .map((p) => {
      const base = computePlayerStats(p.id, p.name, p.avatarColor, matches, (p as Player & { emoji?: string | null }).emoji);
      return { ...base, drawn: 0, leaguePoints: base.won * 3 };
    })
    .sort((a, b) => {
      if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
      return (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
    });
}

/**
 * Compute individual standings for a ROTATING_DOUBLES competition.
 * Each player earns 2pts for a win, 0 for a loss. Referees earn no points but get refCount.
 */
export function computeRotatingDoublesStandings(
  players: (Player & { emoji?: string | null })[],
  matches: MatchWithSets[]
): RotatingDoublesStandingsRow[] {
  const stats: Record<string, RotatingDoublesStandingsRow> = {};

  for (const p of players) {
    stats[p.id] = {
      playerId: p.id,
      name: p.name,
      avatarColor: p.avatarColor,
      emoji: p.emoji,
      played: 0, won: 0, lost: 0,
      leaguePoints: 0,
      pointsFor: 0, pointsAgainst: 0, pointsDiff: 0,
      refCount: 0,
      form: [],
      winRate: 0,
    };
  }

  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED" && m.type === "DOUBLES"
  );

  for (const m of completedMatches) {
    // Track referee
    if (m.refereeId && stats[m.refereeId]) {
      stats[m.refereeId].refCount++;
    }

    if (!m.team1 || !m.team2 || m.sets.length === 0) continue;

    const winner = getMatchWinner(m.sets);
    if (winner === 0) continue;

    const team1Ids = m.team1.players.map((tp) => tp.player.id);
    const team2Ids = m.team2.players.map((tp) => tp.player.id);

    const totalScore1 = m.sets.reduce((a, s) => a + s.score1, 0);
    const totalScore2 = m.sets.reduce((a, s) => a + s.score2, 0);

    for (const pid of team1Ids) {
      if (!stats[pid]) continue;
      stats[pid].played++;
      stats[pid].pointsFor += totalScore1;
      stats[pid].pointsAgainst += totalScore2;
      if (winner === 1) {
        stats[pid].won++;
        stats[pid].leaguePoints += 2;
        stats[pid].form = [...stats[pid].form, "W"].slice(-5);
      } else {
        stats[pid].lost++;
        stats[pid].form = [...stats[pid].form, "L"].slice(-5);
      }
    }

    for (const pid of team2Ids) {
      if (!stats[pid]) continue;
      stats[pid].played++;
      stats[pid].pointsFor += totalScore2;
      stats[pid].pointsAgainst += totalScore1;
      if (winner === 2) {
        stats[pid].won++;
        stats[pid].leaguePoints += 2;
        stats[pid].form = [...stats[pid].form, "W"].slice(-5);
      } else {
        stats[pid].lost++;
        stats[pid].form = [...stats[pid].form, "L"].slice(-5);
      }
    }
  }

  // Compute derived fields
  for (const s of Object.values(stats)) {
    s.pointsDiff = s.pointsFor - s.pointsAgainst;
    s.winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
  }

  return Object.values(stats).sort((a, b) => {
    if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    return b.winRate - a.winRate;
  });
}

export function computeHeadToHead(
  playerIds: string[],
  matches: MatchWithSets[]
): Record<string, Record<string, { wins: number; losses: number }>> {
  const h2h: Record<string, Record<string, { wins: number; losses: number }>> = {};
  for (const id of playerIds) {
    h2h[id] = {};
    for (const id2 of playerIds) {
      if (id !== id2) h2h[id][id2] = { wins: 0, losses: 0 };
    }
  }
  for (const m of matches) {
    if (m.type !== "SINGLES" || m.status !== "COMPLETED") continue;
    if (!m.player1Id || !m.player2Id) continue;
    const winner = getMatchWinner(m.sets);
    if (winner === 0) continue;
    const winnerId = winner === 1 ? m.player1Id : m.player2Id;
    const loserId = winner === 1 ? m.player2Id : m.player1Id;
    if (h2h[winnerId]?.[loserId]) {
      h2h[winnerId][loserId].wins++;
      h2h[loserId][winnerId].losses++;
    }
  }
  return h2h;
}
