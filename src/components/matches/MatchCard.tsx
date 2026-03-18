import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { getMatchWinner } from "@/lib/stats";
import { formatDate } from "@/lib/utils";
import type { Match, Set, Player, DoublesTeam, DoublesTeamPlayer } from "@prisma/client";

type MatchWithDetails = Match & {
  sets: Set[];
  player1: Player | null;
  player2: Player | null;
  team1: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
  team2: (DoublesTeam & { players: (DoublesTeamPlayer & { player: Player })[] }) | null;
};

interface MatchCardProps {
  match: MatchWithDetails;
  groupCode: string;
}

export function MatchCard({ match, groupCode }: MatchCardProps) {
  const winner = getMatchWinner(match.sets);
  const score1 = match.sets.filter((s) => s.score1 > s.score2).length;
  const score2 = match.sets.filter((s) => s.score2 > s.score1).length;

  const side1Name =
    match.type === "SINGLES"
      ? match.player1?.name ?? "TBD"
      : match.team1?.players.map((p) => p.player.name).join(" & ") ?? "TBD";

  const side2Name =
    match.type === "SINGLES"
      ? match.player2?.name ?? "TBD"
      : match.team2?.players.map((p) => p.player.name).join(" & ") ?? "TBD";

  const side1Color =
    match.type === "SINGLES" ? match.player1?.avatarColor ?? "#6366f1" : "#6366f1";
  const side2Color =
    match.type === "SINGLES" ? match.player2?.avatarColor ?? "#8b5cf6" : "#8b5cf6";

  return (
    <Link href={`/g/${groupCode}/matches/${match.id}`}>
      <GlassCard hover padding="sm" className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GlassBadge variant={match.type === "DOUBLES" ? "info" : "default"}>
              {match.type}
            </GlassBadge>
            {match.status === "PENDING" && (
              <GlassBadge variant="warning">Pending</GlassBadge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PlayerAvatar name={side1Name} avatarColor={side1Color} size="xs" />
            <span className={`text-sm font-medium truncate ${winner === 1 ? "text-white" : "text-white/60"}`}>
              {side1Name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <PlayerAvatar name={side2Name} avatarColor={side2Color} size="xs" />
            <span className={`text-sm font-medium truncate ${winner === 2 ? "text-white" : "text-white/60"}`}>
              {side2Name}
            </span>
          </div>
        </div>
        {match.status === "COMPLETED" && (
          <div className="flex-shrink-0 text-right">
            <div className={`text-xl font-bold ${winner === 1 ? "text-emerald-400" : "text-white/60"}`}>
              {score1}
            </div>
            <div className={`text-xl font-bold ${winner === 2 ? "text-emerald-400" : "text-white/60"}`}>
              {score2}
            </div>
          </div>
        )}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-white/30">{formatDate(match.playedAt)}</p>
        </div>
      </GlassCard>
    </Link>
  );
}
