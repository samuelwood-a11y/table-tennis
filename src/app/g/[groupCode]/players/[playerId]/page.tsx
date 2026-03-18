import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { StatCard } from "@/components/stats/StatCard";
import { MatchCard } from "@/components/matches/MatchCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { computePlayerStats, computeHeadToHead } from "@/lib/stats";
import { formatDate } from "@/lib/utils";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ groupCode: string; playerId: string }>;
}) {
  const { groupCode, playerId } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player || player.groupId !== group.id) notFound();

  const allPlayers = await prisma.player.findMany({ where: { groupId: group.id } });

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

  const stats = computePlayerStats(player.id, player.name, player.avatarColor, allMatches);

  const playerMatches = allMatches.filter(
    (m) =>
      m.type === "SINGLES" &&
      (m.player1Id === playerId || m.player2Id === playerId)
  );

  const h2h = computeHeadToHead(
    allPlayers.map((p) => p.id),
    allMatches
  );

  const opponents = allPlayers.filter((p) => p.id !== playerId);

  return (
    <div className="space-y-8">
      <PageHeader backHref={`/g/${groupCode}/players`} title="" />

      {/* Profile Hero */}
      <GlassCard>
        <div className="flex items-center gap-5">
          <PlayerAvatar name={player.name} avatarColor={player.avatarColor} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{player.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">Member since {formatDate(player.createdAt)}</p>
            <div className="flex gap-2 mt-3">
              {stats.form.map((result, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                    result === "W"
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-red-500/30 text-red-300"
                  }`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
          {stats.streak !== 0 && (
            <GlassBadge variant={stats.streak > 0 ? "success" : "danger"} className="text-sm px-3 py-1">
              {stats.streak > 0 ? `🔥 ${stats.streak} Win Streak` : `❄️ ${Math.abs(stats.streak)} Loss Streak`}
            </GlassBadge>
          )}
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Played" value={stats.played} icon="🏓" />
        <StatCard label="Won" value={stats.won} icon="✅" color="text-emerald-400" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} icon="📈" color="text-violet-400" />
        <StatCard label="Sets Won" value={stats.setsWon} icon="🎯" color="text-blue-400" />
      </div>

      {/* Head to Head */}
      {opponents.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Head to Head</h2>
          <GlassCard padding="none" className="overflow-hidden">
            {opponents.map((opp) => {
              const record = h2h[playerId]?.[opp.id];
              if (!record) return null;
              const total = record.wins + record.losses;
              const winPct = total > 0 ? Math.round((record.wins / total) * 100) : 0;
              return (
                <div key={opp.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                  <PlayerAvatar name={opp.name} avatarColor={opp.avatarColor} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{opp.name}</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${winPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-emerald-400 font-bold text-sm">{record.wins}</span>
                    <span className="text-white/30 text-sm"> - </span>
                    <span className="text-red-400 font-bold text-sm">{record.losses}</span>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      )}

      {/* Match History */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Match History</h2>
        {playerMatches.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-white/40 text-sm">No matches played yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {playerMatches.slice(0, 10).map((match) => (
              <MatchCard key={match.id} match={match} groupCode={groupCode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
