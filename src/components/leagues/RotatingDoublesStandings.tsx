import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import type { RotatingDoublesStandingsRow } from "@/lib/stats";
import Link from "next/link";

interface RotatingDoublesStandingsProps {
  standings: RotatingDoublesStandingsRow[];
  groupCode: string;
}

export function RotatingDoublesStandings({ standings, groupCode }: RotatingDoublesStandingsProps) {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-xs text-white/40 font-medium px-4 py-3 w-8">#</th>
            <th className="text-left text-xs text-white/40 font-medium px-2 py-3">Player</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">P</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">W</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">L</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-16">PF-PA</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">Ref</th>
            <th className="text-center text-xs text-white/50 font-semibold px-3 py-3 w-12">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.playerId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3">
                <span className={`text-sm font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-white/30"}`}>
                  {i + 1}
                </span>
              </td>
              <td className="px-2 py-3">
                <Link href={`/g/${groupCode}/players/${row.playerId}`}>
                  <div className="flex items-center gap-2">
                    <PlayerAvatar name={row.name} avatarColor={row.avatarColor} emoji={row.emoji} size="xs" />
                    <span className="text-sm text-white font-medium">{row.name}</span>
                  </div>
                </Link>
              </td>
              <td className="text-center text-sm text-white/60 px-2 py-3">{row.played}</td>
              <td className="text-center text-sm text-emerald-400 px-2 py-3">{row.won}</td>
              <td className="text-center text-sm text-red-400 px-2 py-3">{row.lost}</td>
              <td className="text-center text-xs text-white/50 px-2 py-3">
                <span className={row.pointsDiff >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {row.pointsDiff > 0 ? "+" : ""}{row.pointsDiff}
                </span>
              </td>
              <td className="text-center text-xs text-blue-400 px-2 py-3">{row.refCount}</td>
              <td className="text-center px-3 py-3">
                <span className="text-sm font-bold text-violet-300">{row.leaguePoints}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
