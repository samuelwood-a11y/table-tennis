import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { PlayerAvatar } from "./PlayerAvatar";
import type { Player } from "@prisma/client";
import type { PlayerStats } from "@/lib/stats";

interface PlayerCardProps {
  player: Player;
  stats: PlayerStats;
  groupCode: string;
  rank?: number;
}

export function PlayerCard({ player, stats, groupCode, rank }: PlayerCardProps) {
  return (
    <Link href={`/g/${groupCode}/players/${player.id}`}>
      <GlassCard hover className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {rank && (
            <span className="text-white/30 text-sm font-mono w-5 text-right flex-shrink-0">
              {rank}
            </span>
          )}
          <PlayerAvatar name={player.name} avatarColor={player.avatarColor} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{player.name}</p>
            <p className="text-xs text-white/40">
              {stats.played} played · {stats.winRate}% win rate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1">
            {stats.form.map((result, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                  result === "W"
                    ? "bg-emerald-500/30 text-emerald-300"
                    : "bg-red-500/30 text-red-300"
                }`}
              >
                {result}
              </span>
            ))}
          </div>
          {stats.streak !== 0 && (
            <GlassBadge variant={stats.streak > 0 ? "success" : "danger"}>
              {stats.streak > 0 ? `W${stats.streak}` : `L${Math.abs(stats.streak)}`}
            </GlassBadge>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
