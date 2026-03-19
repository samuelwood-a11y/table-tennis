import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import type { PairStandingsRow } from "@/lib/doubles-pairs";

interface PairStandingsTableProps {
  standings: PairStandingsRow[];
}

const positionColor = (i: number) =>
  i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-white/30";

export function PairStandingsTable({ standings }: PairStandingsTableProps) {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-xs text-white/40 font-medium px-4 py-3 w-8">#</th>
            <th className="text-left text-xs text-white/40 font-medium px-2 py-3">Pair</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">P</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">W</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-10">L</th>
            <th className="text-center text-xs text-white/40 font-medium px-2 py-3 w-12">Sets</th>
            <th className="text-center text-xs text-white/50 font-semibold px-3 py-3 w-12">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.teamId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3">
                <span className={`text-sm font-bold ${positionColor(i)}`}>{i + 1}</span>
              </td>
              <td className="px-2 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <PlayerAvatar
                      name={row.playerNames[0]}
                      avatarColor={row.avatarColors[0]}
                      size="xs"
                    />
                    <PlayerAvatar
                      name={row.playerNames[1]}
                      avatarColor={row.avatarColors[1]}
                      size="xs"
                    />
                  </div>
                  <span className="text-sm text-white font-medium">
                    {row.playerNames[0]} <span className="text-white/30">+</span> {row.playerNames[1]}
                  </span>
                </div>
              </td>
              <td className="text-center text-sm text-white/60 px-2 py-3">{row.played}</td>
              <td className="text-center text-sm text-emerald-400 px-2 py-3">{row.won}</td>
              <td className="text-center text-sm text-red-400 px-2 py-3">{row.lost}</td>
              <td className="text-center text-xs text-white/50 px-2 py-3">
                {row.setsWon}-{row.setsLost}
              </td>
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
