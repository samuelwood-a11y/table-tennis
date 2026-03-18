export type Sport = "TABLE_TENNIS" | "PADEL" | "SQUASH";

export interface SportConfig {
  id: Sport;
  name: string;
  emoji: string;
  accentColor: string;
  matchIcon: string;
  defaultMatchType: string;
  allowedMatchTypes: { id: string; label: string; icon: string }[];
  defaultLeagueFormat: string;
  allowedLeagueFormats: { id: string; label: string; icon: string }[];
  defaultTournamentFormat: string;
  allowedTournamentFormats: { id: string; label: string; icon: string }[];
  scoring: {
    setLabel: string;
    pointLabel: string;
    defaultSetsCount: number;
    description: string;
  };
  terminology: {
    match: string;
    set: string;
    league: string;
    tournament: string;
  };
}

export const SPORT_CONFIGS: Record<Sport, SportConfig> = {
  TABLE_TENNIS: {
    id: "TABLE_TENNIS",
    name: "Table Tennis",
    emoji: "🏓",
    accentColor: "#6366f1",
    matchIcon: "🏓",
    defaultMatchType: "SINGLES",
    allowedMatchTypes: [
      { id: "SINGLES", label: "Singles", icon: "🏓" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    defaultLeagueFormat: "SINGLES",
    allowedLeagueFormats: [
      { id: "SINGLES", label: "Singles", icon: "🏓" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
      { id: "ROTATING_DOUBLES", label: "Rotating", icon: "🔄" },
    ],
    defaultTournamentFormat: "SINGLES",
    allowedTournamentFormats: [
      { id: "SINGLES", label: "Singles", icon: "🏓" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    scoring: {
      setLabel: "Game",
      pointLabel: "Point",
      defaultSetsCount: 1,
      description: "Points to 11, win by 2",
    },
    terminology: {
      match: "Match",
      set: "Game",
      league: "League",
      tournament: "Tournament",
    },
  },
  PADEL: {
    id: "PADEL",
    name: "Padel",
    emoji: "🎾",
    accentColor: "#22c55e",
    matchIcon: "🎾",
    defaultMatchType: "DOUBLES",
    allowedMatchTypes: [
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
      { id: "SINGLES", label: "Singles", icon: "🎾" },
    ],
    defaultLeagueFormat: "DOUBLES",
    allowedLeagueFormats: [
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    defaultTournamentFormat: "DOUBLES",
    allowedTournamentFormats: [
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    scoring: {
      setLabel: "Set",
      pointLabel: "Game",
      defaultSetsCount: 3,
      description: "Sets to 6 games, best of 3",
    },
    terminology: {
      match: "Match",
      set: "Set",
      league: "League",
      tournament: "Tournament",
    },
  },
  SQUASH: {
    id: "SQUASH",
    name: "Squash",
    emoji: "🟡",
    accentColor: "#f59e0b",
    matchIcon: "🟡",
    defaultMatchType: "SINGLES",
    allowedMatchTypes: [
      { id: "SINGLES", label: "Singles", icon: "🟡" },
    ],
    defaultLeagueFormat: "SINGLES",
    allowedLeagueFormats: [
      { id: "SINGLES", label: "Singles", icon: "🟡" },
    ],
    defaultTournamentFormat: "SINGLES",
    allowedTournamentFormats: [
      { id: "SINGLES", label: "Singles", icon: "🟡" },
    ],
    scoring: {
      setLabel: "Game",
      pointLabel: "Point",
      defaultSetsCount: 3,
      description: "PAR 11, win by 2, best of 3 or 5",
    },
    terminology: {
      match: "Match",
      set: "Game",
      league: "League",
      tournament: "Tournament",
    },
  },
};

export const SPORTS_LIST: SportConfig[] = [
  SPORT_CONFIGS.TABLE_TENNIS,
  SPORT_CONFIGS.PADEL,
  SPORT_CONFIGS.SQUASH,
];

export function getSportConfig(sport: string): SportConfig {
  return SPORT_CONFIGS[sport as Sport] ?? SPORT_CONFIGS.TABLE_TENNIS;
}
