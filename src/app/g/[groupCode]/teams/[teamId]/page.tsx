import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/stats/StatCard";
import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { getSportConfig } from "@/lib/sports";
import Link from "next/link";

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ groupCode: string; teamId: string }>;
}) {
  const { groupCode, teamId } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      players: {
        include: { player: true },
        orderBy: [{ isCaptain: "desc" }],
      },
    },
  });

  if (!team || team.groupId !== group.id) notFound();

  const matches = await prisma.match.findMany({
    where: {
      groupId: group.id,
      type: "TEAM",
      status: "COMPLETED",
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    include: {
      sets: true,
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { playedAt: "desc" },
    take: 10,
  });

  const sport = (group as any).sport ?? "TABLE_TENNIS";
  const sportConfig = getSportConfig(sport);

  let won = 0, lost = 0, drawn = 0, goalsFor = 0, goalsAgainst = 0;
  for (const m of matches) {
    const isHome = m.homeTeamId === teamId;
    const gf = m.sets.reduce((s, set) => s + (isHome ? set.score1 : set.score2), 0);
    const ga = m.sets.reduce((s, set) => s + (isHome ? set.score2 : set.score1), 0);
    goalsFor += gf;
    goalsAgainst += ga;
    if (gf > ga) won++;
    else if (ga > gf) lost++;
    else drawn++;
  }

  return (
    <div className="space-y-8">
      <PageHeader backHref={`/g/${groupCode}/teams`} title="" />

      {/* Hero */}
      <GlassCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <TeamAvatar
              name={team.name}
              primaryColor={team.primaryColor}
              imageUrl={team.imageUrl}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              <div className="flex gap-2 mt-2">
                <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: team.primaryColor }} />
                {team.secondaryColor && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: team.secondaryColor }} />
                )}
              </div>
              <p className="text-white/40 text-sm mt-1">{team.players.length} players in squad</p>
            </div>
          </div>
          <Link
            href={`/g/${groupCode}/teams/${teamId}/edit`}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg glass glass-hover"
          >
            Edit
          </Link>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Played" value={matches.length} icon={sportConfig.matchIcon} />
        <StatCard label="Won" value={won} icon="✅" color="text-emerald-400" />
        <StatCard label={sportConfig.terminology.scoreUnit + " For"} value={goalsFor} icon="⚽" color="text-blue-400" />
        <StatCard label="Win Rate" value={matches.length > 0 ? `${Math.round((won / matches.length) * 100)}%` : "0%"} icon="📈" color="text-violet-400" />
      </div>

      {/* Players */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Squad</h2>
        {team.players.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-white/40 text-sm">No players in squad yet</p>
            <Link href={`/g/${groupCode}/teams/${teamId}/edit`} className="text-violet-400 text-sm mt-1 inline-block">
              Add players →
            </Link>
          </GlassCard>
        ) : (
          <GlassCard padding="none" className="overflow-hidden">
            {team.players.map(({ player, isCaptain, position }) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                <PlayerAvatar
                  name={player.name}
                  avatarColor={player.avatarColor}
                  emoji={(player as any).emoji}
                  imageUrl={(player as any).imageUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  {position && <p className="text-xs text-white/40">{position}</p>}
                </div>
                {isCaptain && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Captain
                  </span>
                )}
              </div>
            ))}
          </GlassCard>
        )}
      </div>

      {/* Recent matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Recent Results</h2>
          <div className="space-y-2">
            {matches.map((m) => {
              const isHome = m.homeTeamId === teamId;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const gf = m.sets.reduce((s, set) => s + (isHome ? set.score1 : set.score2), 0);
              const ga = m.sets.reduce((s, set) => s + (isHome ? set.score2 : set.score1), 0);
              const result = gf > ga ? "W" : gf < ga ? "L" : "D";
              return (
                <GlassCard key={m.id} padding="sm" className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                    result === "W" ? "bg-emerald-500/30 text-emerald-300" :
                    result === "L" ? "bg-red-500/30 text-red-300" :
                    "bg-amber-500/30 text-amber-300"
                  }`}>
                    {result}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white/70">vs {opponent?.name ?? "Unknown"}</p>
                  </div>
                  <span className="text-sm font-bold text-white">{gf}–{ga}</span>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
