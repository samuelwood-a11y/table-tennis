import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/stats/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { computePlayerStats, computeHeadToHead } from "@/lib/stats";
import Link from "next/link";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const players = await prisma.player.findMany({ where: { groupId: group.id } });
  const allMatches = await prisma.match.findMany({
    where: { groupId: group.id },
    include: {
      sets: true,
      player1: true,
      player2: true,
      team1: { include: { players: { include: { player: true } } } },
      team2: { include: { players: { include: { player: true } } } },
    },
    orderBy: { playedAt: "desc" },
  });

  const completed = allMatches.filter((m) => m.status === "COMPLETED");
  const singles = completed.filter((m) => m.type === "SINGLES");
  const doubles = completed.filter((m) => m.type === "DOUBLES");
  const totalSets = allMatches.reduce((acc, m) => acc + m.sets.length, 0);

  const playerStats = players.map((p) =>
    computePlayerStats(p.id, p.name, p.avatarColor, allMatches)
  );
  const sorted = [...playerStats].sort((a, b) => b.winRate - a.winRate);
  const topPlayer = sorted[0];
  const mostActive = [...playerStats].sort((a, b) => b.played - a.played)[0];
  const bestStreak = [...playerStats].sort((a, b) => b.streak - a.streak)[0];

  const h2h = computeHeadToHead(players.map((p) => p.id), allMatches);

  return (
    <div className="space-y-8">
      <PageHeader title="Stats" subtitle="Group-wide analytics" />

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Matches" value={completed.length} icon="🏓" />
        <StatCard label="Singles" value={singles.length} icon="👤" color="text-blue-400" />
        <StatCard label="Doubles" value={doubles.length} icon="👥" color="text-violet-400" />
        <StatCard label="Total Sets" value={totalSets} icon="🎯" color="text-emerald-400" />
      </div>

      {/* Highlights */}
      {topPlayer && (
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <div className="text-2xl mb-2">👑</div>
            <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Top Player</p>
            <PlayerAvatar name={topPlayer.name} avatarColor={topPlayer.avatarColor} size="lg" className="mx-auto mb-2" />
            <p className="text-white font-semibold">{topPlayer.name}</p>
            <p className="text-violet-300 text-lg font-bold mt-1">{topPlayer.winRate}%</p>
          </GlassCard>

          {mostActive && (
            <GlassCard className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Most Active</p>
              <PlayerAvatar name={mostActive.name} avatarColor={mostActive.avatarColor} size="lg" className="mx-auto mb-2" />
              <p className="text-white font-semibold">{mostActive.name}</p>
              <p className="text-blue-300 text-lg font-bold mt-1">{mostActive.played} played</p>
            </GlassCard>
          )}

          {bestStreak && bestStreak.streak > 1 && (
            <GlassCard className="text-center">
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Hot Streak</p>
              <PlayerAvatar name={bestStreak.name} avatarColor={bestStreak.avatarColor} size="lg" className="mx-auto mb-2" />
              <p className="text-white font-semibold">{bestStreak.name}</p>
              <p className="text-amber-300 text-lg font-bold mt-1">{bestStreak.streak} wins</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Leaderboard</h2>
        <GlassCard padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/40 px-4 py-3 w-8">#</th>
                <th className="text-left text-xs text-white/40 px-2 py-3">Player</th>
                <th className="text-center text-xs text-white/40 px-2 py-3">P</th>
                <th className="text-center text-xs text-white/40 px-2 py-3">W</th>
                <th className="text-center text-xs text-white/40 px-2 py-3">L</th>
                <th className="text-center text-xs text-white/40 px-2 py-3">Win%</th>
                <th className="text-center text-xs text-white/40 px-2 py-3">Streak</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((stat, i) => (
                <tr key={stat.playerId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-white/30"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/g/${groupCode}/players/${stat.playerId}`}>
                      <div className="flex items-center gap-2 hover:opacity-80">
                        <PlayerAvatar name={stat.name} avatarColor={stat.avatarColor} size="xs" />
                        <span className="text-sm text-white">{stat.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="text-center text-sm text-white/60 px-2 py-3">{stat.played}</td>
                  <td className="text-center text-sm text-emerald-400 px-2 py-3">{stat.won}</td>
                  <td className="text-center text-sm text-red-400 px-2 py-3">{stat.lost}</td>
                  <td className="text-center text-sm font-bold text-violet-300 px-2 py-3">{stat.winRate}%</td>
                  <td className="text-center px-2 py-3">
                    {stat.streak !== 0 && (
                      <span className={`text-xs font-bold ${stat.streak > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stat.streak > 0 ? `W${stat.streak}` : `L${Math.abs(stat.streak)}`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* Head to Head Matrix */}
      {players.length >= 2 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Head to Head</h2>
          <div className="overflow-x-auto">
            <GlassCard padding="none" className="overflow-hidden inline-block min-w-full">
              <table className="text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/30 px-3 py-2 min-w-24" />
                    {players.map((p) => (
                      <th key={p.id} className="text-center text-white/40 px-2 py-2 min-w-16">
                        <PlayerAvatar name={p.name} avatarColor={p.avatarColor} size="xs" className="mx-auto" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p1) => (
                    <tr key={p1.id} className="border-b border-white/5">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <PlayerAvatar name={p1.name} avatarColor={p1.avatarColor} size="xs" />
                          <span className="text-white/60">{p1.name}</span>
                        </div>
                      </td>
                      {players.map((p2) => {
                        if (p1.id === p2.id) {
                          return <td key={p2.id} className="text-center px-2 py-2 text-white/10">—</td>;
                        }
                        const record = h2h[p1.id]?.[p2.id];
                        if (!record) return <td key={p2.id} className="text-center px-2 py-2 text-white/20">-</td>;
                        const total = record.wins + record.losses;
                        return (
                          <td key={p2.id} className="text-center px-2 py-2">
                            {total > 0 ? (
                              <span className={`font-bold ${record.wins > record.losses ? "text-emerald-400" : record.wins < record.losses ? "text-red-400" : "text-white/50"}`}>
                                {record.wins}-{record.losses}
                              </span>
                            ) : (
                              <span className="text-white/20">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
