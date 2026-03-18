import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { getMatchWinner } from "@/lib/stats";
import { formatDate, formatTime } from "@/lib/utils";
import { DeleteMatchButton } from "@/components/matches/DeleteMatchButton";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ groupCode: string; matchId: string }>;
}) {
  const { groupCode, matchId } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      player1: true,
      player2: true,
      team1: { include: { players: { include: { player: true } } } },
      team2: { include: { players: { include: { player: true } } } },
      league: true,
      tournament: true,
    },
  });

  if (!match || match.groupId !== group.id) notFound();

  const winner = getMatchWinner(match.sets);
  const side1Sets = match.sets.filter((s) => s.score1 > s.score2).length;
  const side2Sets = match.sets.filter((s) => s.score2 > s.score1).length;

  const side1Name =
    match.type === "SINGLES"
      ? match.player1?.name ?? "TBD"
      : match.team1?.players.map((p) => p.player.name).join(" & ") ?? "TBD";
  const side2Name =
    match.type === "SINGLES"
      ? match.player2?.name ?? "TBD"
      : match.team2?.players.map((p) => p.player.name).join(" & ") ?? "TBD";
  const side1Color = match.type === "SINGLES" ? match.player1?.avatarColor ?? "#6366f1" : "#6366f1";
  const side2Color = match.type === "SINGLES" ? match.player2?.avatarColor ?? "#8b5cf6" : "#8b5cf6";

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Match" backHref={`/g/${groupCode}/matches`} />

      {/* Scoreboard */}
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <GlassBadge variant={match.type === "DOUBLES" ? "info" : "default"}>
            {match.type}
          </GlassBadge>
          {match.league && (
            <GlassBadge variant="success">{match.league.name}</GlassBadge>
          )}
          {match.tournament && (
            <GlassBadge variant="warning">{match.tournament.name}</GlassBadge>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 mb-4">
          <div className={`flex-1 text-center ${winner === 1 ? "" : "opacity-50"}`}>
            <PlayerAvatar name={side1Name} avatarColor={side1Color} size="lg" className="mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">{side1Name}</p>
            {winner === 1 && <p className="text-emerald-400 text-xs mt-1 font-medium">Winner 🏆</p>}
          </div>

          <div className="flex flex-col items-center px-6">
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${winner === 1 ? "text-white" : "text-white/40"}`}>
                {side1Sets}
              </span>
              <span className="text-white/20 text-2xl">–</span>
              <span className={`text-4xl font-bold ${winner === 2 ? "text-white" : "text-white/40"}`}>
                {side2Sets}
              </span>
            </div>
            <p className="text-white/30 text-xs mt-1">Sets</p>
          </div>

          <div className={`flex-1 text-center ${winner === 2 ? "" : "opacity-50"}`}>
            <PlayerAvatar name={side2Name} avatarColor={side2Color} size="lg" className="mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">{side2Name}</p>
            {winner === 2 && <p className="text-emerald-400 text-xs mt-1 font-medium">Winner 🏆</p>}
          </div>
        </div>

        {/* Set breakdown */}
        {match.sets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 mb-2 text-center">Set by Set</p>
            {match.sets.map((set) => {
              const sw1 = set.score1 > set.score2;
              return (
                <div key={set.id} className="flex items-center justify-between py-1.5">
                  <span className={`font-bold text-sm w-16 text-center ${sw1 ? "text-white" : "text-white/40"}`}>
                    {set.score1}
                  </span>
                  <span className="text-xs text-white/30">Set {set.setNumber}</span>
                  <span className={`font-bold text-sm w-16 text-center ${!sw1 ? "text-white" : "text-white/40"}`}>
                    {set.score2}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Meta */}
      <GlassCard>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Date</span>
            <span className="text-white">{formatDate(match.playedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Time</span>
            <span className="text-white">{formatTime(match.playedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Status</span>
            <GlassBadge variant={match.status === "COMPLETED" ? "success" : "warning"}>
              {match.status}
            </GlassBadge>
          </div>
        </div>
      </GlassCard>

      <DeleteMatchButton matchId={match.id} groupCode={groupCode} />
    </div>
  );
}
