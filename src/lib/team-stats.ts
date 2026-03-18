import type { PointsConfig } from "./sports";

export interface TeamStandingsRow {
  teamId: string;
  teamName: string;
  primaryColor: string;
  imageUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

interface TeamMeta {
  id: string;
  name: string;
  primaryColor: string;
  imageUrl?: string | null;
}

interface MatchInput {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  status: string;
  sets: { score1: number; score2: number }[];
  playedAt: Date;
}

export function computeTeamStandings(
  teams: TeamMeta[],
  matches: MatchInput[],
  pointsConfig: PointsConfig
): TeamStandingsRow[] {
  const stats: Record<string, TeamStandingsRow> = {};

  for (const t of teams) {
    stats[t.id] = {
      teamId: t.id,
      teamName: t.name,
      primaryColor: t.primaryColor,
      imageUrl: t.imageUrl ?? null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      form: [],
    };
  }

  const completed = matches
    .filter((m) => m.status === "COMPLETED" && m.homeTeamId && m.awayTeamId)
    .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());

  for (const m of completed) {
    const homeId = m.homeTeamId!;
    const awayId = m.awayTeamId!;
    if (!stats[homeId] || !stats[awayId]) continue;

    const homeGoals = m.sets.reduce((s, set) => s + set.score1, 0);
    const awayGoals = m.sets.reduce((s, set) => s + set.score2, 0);

    stats[homeId].played++;
    stats[awayId].played++;
    stats[homeId].goalsFor += homeGoals;
    stats[homeId].goalsAgainst += awayGoals;
    stats[awayId].goalsFor += awayGoals;
    stats[awayId].goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      stats[homeId].won++;
      stats[homeId].points += pointsConfig.win;
      stats[homeId].form = ([...stats[homeId].form, "W"] as ("W" | "D" | "L")[]).slice(-5);
      stats[awayId].lost++;
      stats[awayId].points += pointsConfig.loss;
      stats[awayId].form = ([...stats[awayId].form, "L"] as ("W" | "D" | "L")[]).slice(-5);
    } else if (awayGoals > homeGoals) {
      stats[awayId].won++;
      stats[awayId].points += pointsConfig.win;
      stats[awayId].form = ([...stats[awayId].form, "W"] as ("W" | "D" | "L")[]).slice(-5);
      stats[homeId].lost++;
      stats[homeId].points += pointsConfig.loss;
      stats[homeId].form = ([...stats[homeId].form, "L"] as ("W" | "D" | "L")[]).slice(-5);
    } else {
      stats[homeId].drawn++;
      stats[homeId].points += pointsConfig.draw;
      stats[homeId].form = ([...stats[homeId].form, "D"] as ("W" | "D" | "L")[]).slice(-5);
      stats[awayId].drawn++;
      stats[awayId].points += pointsConfig.draw;
      stats[awayId].form = ([...stats[awayId].form, "D"] as ("W" | "D" | "L")[]).slice(-5);
    }
  }

  return Object.values(stats)
    .map((r) => ({ ...r, goalDiff: r.goalsFor - r.goalsAgainst }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
}
