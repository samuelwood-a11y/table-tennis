import { cn } from "@/lib/utils";
import { TeamAvatar } from "./TeamAvatar";
import type { TeamStandingsRow } from "@/lib/team-stats";
import { getSportConfig } from "@/lib/sports";

interface TeamStandingsTableProps {
  rows: TeamStandingsRow[];
  sport: string;
}

export function TeamStandingsTable({ rows, sport }: TeamStandingsTableProps) {
  const config = getSportConfig(sport);
  const scoreLabel = config.terminology.scoreUnit;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-3 py-2 text-white/40 font-medium text-xs w-8">#</th>
            <th className="text-left px-3 py-2 text-white/40 font-medium text-xs">Team</th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-8">P</th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-8">W</th>
            {config.scoring.allowDraw && (
              <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-8">D</th>
            )}
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-8">L</th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-16 hidden sm:table-cell">
              {scoreLabel.charAt(0)}F-{scoreLabel.charAt(0)}A
            </th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-10 hidden sm:table-cell">
              GD
            </th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-10 hidden sm:table-cell">
              Form
            </th>
            <th className="text-center px-2 py-2 text-white/40 font-medium text-xs w-10">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.teamId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <td className="px-3 py-3 text-white/40 text-xs">{i + 1}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <TeamAvatar
                    name={row.teamName}
                    primaryColor={row.primaryColor}
                    imageUrl={row.imageUrl}
                    size="sm"
                  />
                  <span className="font-medium text-white truncate">{row.teamName}</span>
                </div>
              </td>
              <td className="px-2 py-3 text-center text-white/60">{row.played}</td>
              <td className="px-2 py-3 text-center text-emerald-400 font-medium">{row.won}</td>
              {config.scoring.allowDraw && (
                <td className="px-2 py-3 text-center text-white/60">{row.drawn}</td>
              )}
              <td className="px-2 py-3 text-center text-red-400">{row.lost}</td>
              <td className="px-2 py-3 text-center text-white/50 hidden sm:table-cell">
                {row.goalsFor}–{row.goalsAgainst}
              </td>
              <td className={cn("px-2 py-3 text-center font-medium hidden sm:table-cell",
                row.goalDiff > 0 ? "text-emerald-400" : row.goalDiff < 0 ? "text-red-400" : "text-white/40"
              )}>
                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
              </td>
              <td className="px-2 py-3 text-center hidden sm:table-cell">
                <div className="flex gap-0.5 justify-center">
                  {row.form.map((r, fi) => (
                    <span key={fi} className={cn(
                      "w-4 h-4 rounded text-xs flex items-center justify-center font-bold",
                      r === "W" ? "bg-emerald-500/30 text-emerald-300" :
                      r === "D" ? "bg-amber-500/30 text-amber-300" :
                      "bg-red-500/30 text-red-300"
                    )}>
                      {r}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-2 py-3 text-center font-bold text-violet-300">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
