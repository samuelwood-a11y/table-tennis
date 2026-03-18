import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { StatCard } from "@/components/stats/StatCard";
import { MatchCard } from "@/components/matches/MatchCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { computePlayerStats, getMatchWinner } from "@/lib/stats";
import Link from "next/link";

export default async function GroupDashboard({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const [players, recentMatches, leagues, tournaments] = await Promise.all([
    prisma.player.findMany({ where: { groupId: group.id }, orderBy: { createdAt: "asc" } }),
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
      },
    }),
    prisma.league.findMany({
      where: { groupId: group.id },
      include: { _count: { select: { players: true } } },
    }),
    prisma.tournament.findMany({
      where: { groupId: group.id },
      include: { _count: { select: { entries: true } } },
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

  const playerStats = players.map((p) =>
    computePlayerStats(p.id, p.name, p.avatarColor, allMatches)
  );
  const topPlayer = playerStats.sort((a, b) => b.winRate - a.winRate)[0];
  const totalCompleted = allMatches.filter((m) => m.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-white/40 text-sm">Group code:</span>
            <code className="text-violet-300 font-mono text-sm bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-400/20">
              {group.code}
            </code>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Players" value={players.length} icon="👤" />
        <StatCard label="Matches" value={totalCompleted} icon="🏓" color="text-blue-400" />
        <StatCard label="Leagues" value={leagues.length} icon="📊" color="text-emerald-400" />
        <StatCard label="Tournaments" value={tournaments.length} icon="🏆" color="text-amber-400" />
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: `players/new`, icon: "👤", label: "Add Player" },
            { href: `matches/new`, icon: "🏓", label: "Record Match" },
            { href: `generator`, icon: "🎲", label: "Random Match" },
            { href: `leagues/new`, icon: "📊", label: "New League" },
          ].map((action) => (
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
            <h2 className="text-base font-semibold text-white">Recent Matches</h2>
            <Link href={`/g/${groupCode}/matches`} className="text-xs text-violet-400 hover:text-violet-300">
              View all →
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <GlassCard className="text-center py-8">
              <div className="text-3xl mb-2">🏓</div>
              <p className="text-white/40 text-sm">No matches yet</p>
              <Link href={`/g/${groupCode}/matches/new`} className="text-violet-400 text-sm mt-1 inline-block hover:text-violet-300">
                Record first match →
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

        {/* Top Players */}
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
      </div>

      {/* Active Leagues & Tournaments */}
      {(leagues.length > 0 || tournaments.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {leagues.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Leagues</h2>
                <Link href={`/g/${groupCode}/leagues`} className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
              </div>
              <div className="space-y-2">
                {leagues.slice(0, 3).map((league) => (
                  <Link key={league.id} href={`/g/${groupCode}/leagues/${league.id}`}>
                    <GlassCard hover padding="sm" className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <div>
                          <p className="text-sm font-medium text-white">{league.name}</p>
                          <p className="text-xs text-white/40">{league._count.players} players</p>
                        </div>
                      </div>
                      <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"}>
                        {league.status}
                      </GlassBadge>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {tournaments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Tournaments</h2>
                <Link href={`/g/${groupCode}/tournaments`} className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
              </div>
              <div className="space-y-2">
                {tournaments.slice(0, 3).map((tournament) => (
                  <Link key={tournament.id} href={`/g/${groupCode}/tournaments/${tournament.id}`}>
                    <GlassCard hover padding="sm" className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <div>
                          <p className="text-sm font-medium text-white">{tournament.name}</p>
                          <p className="text-xs text-white/40">{tournament._count.entries} players</p>
                        </div>
                      </div>
                      <GlassBadge variant={tournament.status === "ACTIVE" ? "success" : "default"}>
                        {tournament.status}
                      </GlassBadge>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
