export type Sport =
  | "TABLE_TENNIS"
  | "PADEL"
  | "SQUASH"
  | "TENNIS"
  | "FOOTBALL"
  | "RUGBY"
  | "NETBALL";

export interface PointsConfig {
  win: number;
  draw: number;
  loss: number;
}

export interface SportConfig {
  id: Sport;
  name: string;
  emoji: string;
  accentColor: string;
  matchIcon: string;
  isTeamSport: boolean;
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
    allowDraw: boolean;
  };
  terminology: {
    match: string;
    set: string;
    league: string;
    tournament: string;
    player: string;
    team: string;
    scoreUnit: string;
  };
  defaultPointsConfig: PointsConfig;
}

export const SPORT_CONFIGS: Record<Sport, SportConfig> = {
  TABLE_TENNIS: {
    id: "TABLE_TENNIS",
    name: "Table Tennis",
    emoji: "🏓",
    accentColor: "#6366f1",
    matchIcon: "🏓",
    isTeamSport: false,
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
      allowDraw: false,
    },
    terminology: {
      match: "Match",
      set: "Game",
      league: "League",
      tournament: "Tournament",
      player: "Player",
      team: "Team",
      scoreUnit: "Points",
    },
    defaultPointsConfig: { win: 2, draw: 0, loss: 0 },
  },

  PADEL: {
    id: "PADEL",
    name: "Padel",
    emoji: "🎾",
    accentColor: "#22c55e",
    matchIcon: "🎾",
    isTeamSport: false,
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
      allowDraw: false,
    },
    terminology: {
      match: "Match",
      set: "Set",
      league: "League",
      tournament: "Tournament",
      player: "Player",
      team: "Pair",
      scoreUnit: "Games",
    },
    defaultPointsConfig: { win: 2, draw: 0, loss: 0 },
  },

  SQUASH: {
    id: "SQUASH",
    name: "Squash",
    emoji: "🟡",
    accentColor: "#f59e0b",
    matchIcon: "🟡",
    isTeamSport: false,
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
      description: "PAR 11, win by 2, best of 3/5",
      allowDraw: false,
    },
    terminology: {
      match: "Match",
      set: "Game",
      league: "League",
      tournament: "Tournament",
      player: "Player",
      team: "Team",
      scoreUnit: "Points",
    },
    defaultPointsConfig: { win: 2, draw: 0, loss: 0 },
  },

  TENNIS: {
    id: "TENNIS",
    name: "Tennis",
    emoji: "🎾",
    accentColor: "#84cc16",
    matchIcon: "🎾",
    isTeamSport: false,
    defaultMatchType: "SINGLES",
    allowedMatchTypes: [
      { id: "SINGLES", label: "Singles", icon: "🎾" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    defaultLeagueFormat: "SINGLES",
    allowedLeagueFormats: [
      { id: "SINGLES", label: "Singles", icon: "🎾" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    defaultTournamentFormat: "SINGLES",
    allowedTournamentFormats: [
      { id: "SINGLES", label: "Singles", icon: "🎾" },
      { id: "DOUBLES", label: "Doubles", icon: "👥" },
    ],
    scoring: {
      setLabel: "Set",
      pointLabel: "Game",
      defaultSetsCount: 3,
      description: "6 games/set, best of 3",
      allowDraw: false,
    },
    terminology: {
      match: "Match",
      set: "Set",
      league: "League",
      tournament: "Tournament",
      player: "Player",
      team: "Pair",
      scoreUnit: "Games",
    },
    defaultPointsConfig: { win: 2, draw: 0, loss: 0 },
  },

  FOOTBALL: {
    id: "FOOTBALL",
    name: "Football",
    emoji: "⚽",
    accentColor: "#22c55e",
    matchIcon: "⚽",
    isTeamSport: true,
    defaultMatchType: "TEAM",
    allowedMatchTypes: [
      { id: "TEAM", label: "Match", icon: "⚽" },
    ],
    defaultLeagueFormat: "TEAM",
    allowedLeagueFormats: [
      { id: "TEAM", label: "League", icon: "📊" },
    ],
    defaultTournamentFormat: "TEAM",
    allowedTournamentFormats: [
      { id: "TEAM", label: "Knockout", icon: "🏆" },
    ],
    scoring: {
      setLabel: "Match",
      pointLabel: "Goal",
      defaultSetsCount: 1,
      description: "Full time score",
      allowDraw: true,
    },
    terminology: {
      match: "Match",
      set: "Match",
      league: "League",
      tournament: "Cup",
      player: "Player",
      team: "Team",
      scoreUnit: "Goals",
    },
    defaultPointsConfig: { win: 3, draw: 1, loss: 0 },
  },

  RUGBY: {
    id: "RUGBY",
    name: "Rugby",
    emoji: "🏉",
    accentColor: "#f97316",
    matchIcon: "🏉",
    isTeamSport: true,
    defaultMatchType: "TEAM",
    allowedMatchTypes: [
      { id: "TEAM", label: "Match", icon: "🏉" },
    ],
    defaultLeagueFormat: "TEAM",
    allowedLeagueFormats: [
      { id: "TEAM", label: "League", icon: "📊" },
    ],
    defaultTournamentFormat: "TEAM",
    allowedTournamentFormats: [
      { id: "TEAM", label: "Knockout", icon: "🏆" },
    ],
    scoring: {
      setLabel: "Match",
      pointLabel: "Point",
      defaultSetsCount: 1,
      description: "Full time points",
      allowDraw: true,
    },
    terminology: {
      match: "Match",
      set: "Match",
      league: "League",
      tournament: "Cup",
      player: "Player",
      team: "Team",
      scoreUnit: "Points",
    },
    defaultPointsConfig: { win: 4, draw: 2, loss: 0 },
  },

  NETBALL: {
    id: "NETBALL",
    name: "Netball",
    emoji: "🏀",
    accentColor: "#ec4899",
    matchIcon: "🏀",
    isTeamSport: true,
    defaultMatchType: "TEAM",
    allowedMatchTypes: [
      { id: "TEAM", label: "Match", icon: "🏀" },
    ],
    defaultLeagueFormat: "TEAM",
    allowedLeagueFormats: [
      { id: "TEAM", label: "League", icon: "📊" },
    ],
    defaultTournamentFormat: "TEAM",
    allowedTournamentFormats: [
      { id: "TEAM", label: "Knockout", icon: "🏆" },
    ],
    scoring: {
      setLabel: "Match",
      pointLabel: "Goal",
      defaultSetsCount: 1,
      description: "Full time goals",
      allowDraw: true,
    },
    terminology: {
      match: "Match",
      set: "Match",
      league: "League",
      tournament: "Tournament",
      player: "Player",
      team: "Team",
      scoreUnit: "Goals",
    },
    defaultPointsConfig: { win: 2, draw: 1, loss: 0 },
  },
};

export const SPORTS_LIST: SportConfig[] = [
  SPORT_CONFIGS.TABLE_TENNIS,
  SPORT_CONFIGS.PADEL,
  SPORT_CONFIGS.SQUASH,
  SPORT_CONFIGS.TENNIS,
  SPORT_CONFIGS.FOOTBALL,
  SPORT_CONFIGS.RUGBY,
  SPORT_CONFIGS.NETBALL,
];

export function getSportConfig(sport: string): SportConfig {
  return SPORT_CONFIGS[sport as Sport] ?? SPORT_CONFIGS.TABLE_TENNIS;
}

export function isTeamSport(sport: string): boolean {
  return getSportConfig(sport).isTeamSport;
}
