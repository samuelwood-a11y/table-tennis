import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { StatCard } from "@/components/stats/StatCard";
import { MatchCard } from "@/components/matches/MatchCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { SportBadge } from "@/components/ui/SportBadge";
import { computePlayerStats } from "@/lib/stats";
import { getSportConfig, isTeamSport } from "@/lib/sports";
import Link from "next/link";

export default async function GroupDashboard({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const sport = (group as any).sport ?? "TABLE_TENNIS";
  const sportConfig = getSportConfig(sport);
  const teamSport = isTeamSport(sport);

  const [players, teams, recentMatches, leagues, tournaments] = await Promise.all([
    prisma.player.findMany({
      where: { groupId: group.id, isArchived: false },
      orderBy: { createdAt: "asc" },
    }),
    prisma.team.findMany({
      where: { groupId: group.id, isArchived: false },
      orderBy: { createdAt: "asc" },
    }),
    prisma.match.findMany({
      where: { groupId: group.id, status: "COMPLETED" },
      orderBy: { playedAt: "desc" },
      take: 5,
      include: {
        sets: true,
        player1: true,
        player2: true,
        team1: { include: { players: { include: { player: true } } } },
        team2: { include: { players: { include: { player: true } } } },
        homeTeam: true,
        awayTeam: true,
      },
    }),
    prisma.league.findMany({
      where: { groupId: group.id, isArchived: false },
      include: { _count: { select: { players: true, teams: true } } },
    }),
    prisma.tournament.findMany({
      where: { groupId: group.id, isArchived: false },
      include: { _count: { select: { entries: true, teamEntries: true } } },
    }),
  ]);

  const allMatches = await prisma.match.findMany({
    where: { groupId: group.id },
    include: {
      sets: true,
      player1: true,
      player2: true,
      team1: { include: { players: { include: { player: true } } } },
      team2: { include: { players: { include: { player: true } } } },
    },
  });

  const playerStats = players
    .map((p) => computePlayerStats(p.id, p.name, p.avatarColor, allMatches))
    .sort((a, b) => b.winRate - a.winRate);

  const totalCompleted = allMatches.filter((m) => m.status === "COMPLETED").length;

  const quickActions = teamSport
    ? [
        { href: `teams/new`, icon: "👥", label: "Add Team" },
        { href: `matches/new`, icon: sportConfig.matchIcon, label: `Record ${sportConfig.terminology.match}` },
        { href: `leagues/new`, icon: "📊", label: `New ${sportConfig.terminology.league}` },
        { href: `tournaments/new`, icon: "🏆", label: `New ${sportConfig.terminology.tournament}` },
      ]
    : [
        { href: `players/new`, icon: "👤", label: "Add Player" },
        { href: `matches/new`, icon: sportConfig.matchIcon, label: "Record Match" },
        ...(sport === "TABLE_TENNIS" ? [{ href: `generator`, icon: "🎲", label: "Random Match" }] : []),
        { href: `leagues/new`, icon: "📊", label: "New League" },
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{group.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <SportBadge sport={sport} />
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm">Code:</span>
              <code className="text-violet-300 font-mono text-sm bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-400/20">
                {group.code}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {teamSport ? (
          <StatCard label="Teams" value={teams.length} icon="👥" />
        ) : (
          <StatCard label="Players" value={players.length} icon="👤" />
        )}
        <StatCard label="Matches" value={totalCompleted} icon={sportConfig.matchIcon} color="text-blue-400" />
        <StatCard label="Leagues" value={leagues.length} icon="📊" color="text-emerald-400" />
        <StatCard label={sportConfig.terminology.tournament + "s"} value={tournaments.length} icon="🏆" color="text-amber-400" />
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={`/g/${groupCode}/${action.href}`}>
              <div className="glass glass-hover rounded-2xl p-4 text-center transition-all duration-200 hover:scale-[1.02]">
                <div className="text-2xl mb-1">{action.icon}</div>
                <div className="text-xs text-white/60 font-medium">{action.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Recent Results</h2>
            <Link href={`/g/${groupCode}/matches`} className="text-xs text-violet-400 hover:text-violet-300">
              View all →
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <GlassCard className="text-center py-8">
              <div className="text-3xl mb-2">{sportConfig.matchIcon}</div>
              <p className="text-white/40 text-sm">No matches yet</p>
              <Link href={`/g/${groupCode}/matches/new`} className="text-violet-400 text-sm mt-1 inline-block hover:text-violet-300">
                Record first {sportConfig.terminology.match.toLowerCase()} →
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} groupCode={groupCode} />
              ))}
            </div>
          )}
        </div>

        {/* Teams (team sports) or Top Players (individual) */}
        {teamSport ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Teams</h2>
              <Link href={`/g/${groupCode}/teams`} className="text-xs text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            {teams.length === 0 ? (
              <GlassCard className="text-center py-8">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-white/40 text-sm">No teams yet</p>
                <Link href={`/g/${groupCode}/teams/new`} className="text-violet-400 text-sm mt-1 inline-block hover:text-violet-300">
                  Add first team →
                </Link>
              </GlassCard>
            ) : (
              <GlassCard padding="none" className="overflow-hidden">
                {teams.slice(0, 5).map((team) => (
                  <Link key={team.id} href={`/g/${groupCode}/teams/${team.id}`}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                      <TeamAvatar name={team.name} primaryColor={team.primaryColor} imageUrl={team.imageUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{team.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                        {team.secondaryColor && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.secondaryColor }} />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </GlassCard>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Top Players</h2>
              <Link href={`/g/${groupCode}/players`} className="text-xs text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            {players.length === 0 ? (
              <GlassCard className="text-center py-8">
                <div className="text-3xl mb-2">👤</div>
                <p className="text-white/40 text-sm">No players yet</p>
                <Link href={`/g/${groupCode}/players/new`} className="text-violet-400 text-sm mt-1 inline-block hover:text-violet-300">
                  Add first player →
                </Link>
              </GlassCard>
            ) : (
              <GlassCard padding="none" className="overflow-hidden">
                {playerStats.slice(0, 5).map((stat, i) => (
                  <Link key={stat.playerId} href={`/g/${groupCode}/players/${stat.playerId}`}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                      <span className={`text-sm font-bold w-4 ${i === 0 ? "text-amber-400" : "text-white/30"}`}>{i + 1}</span>
                      <PlayerAvatar name={stat.name} avatarColor={stat.avatarColor} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{stat.name}</p>
                        <p className="text-xs text-white/40">{stat.played} played</p>
                      </div>
                      <span className="text-sm font-bold text-violet-300">{stat.winRate}%</span>
                    </div>
                  </Link>
                ))}
              </GlassCard>
            )}
          </div>
        )}
      </div>

      {/* Leagues & Tournaments */}
      {(leagues.length > 0 || tournaments.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {leagues.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">{sportConfig.terminology.league}s</h2>
                <Link href={`/g/${groupCode}/leagues`} className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
              </div>
              <div className="space-y-2">
                {leagues.slice(0, 3).map((league) => {
                  const count = teamSport ? league._count.teams : league._count.players;
                  return (
                    <Link key={league.id} href={`/g/${groupCode}/leagues/${league.id}`}>
                      <GlassCard hover padding="sm" className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <div>
                            <p className="text-sm font-medium text-white">{league.name}</p>
                            <p className="text-xs text-white/40">{count} {teamSport ? "teams" : "players"}</p>
                          </div>
                        </div>
                        <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"}>
                          {league.status}
                        </GlassBadge>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {tournaments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">{sportConfig.terminology.tournament}s</h2>
                <Link href={`/g/${groupCode}/tournaments`} className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
              </div>
              <div className="space-y-2">
                {tournaments.slice(0, 3).map((tournament) => {
                  const count = teamSport ? tournament._count.teamEntries : tournament._count.entries;
                  return (
                    <Link key={tournament.id} href={`/g/${groupCode}/tournaments/${tournament.id}`}>
                      <GlassCard hover padding="sm" className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏆</span>
                          <div>
                            <p className="text-sm font-medium text-white">{tournament.name}</p>
                            <p className="text-xs text-white/40">{count} {teamSport ? "teams" : "players"}</p>
                          </div>
                        </div>
                        <GlassBadge variant={tournament.status === "ACTIVE" ? "success" : "default"}>
                          {tournament.status}
                        </GlassBadge>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
