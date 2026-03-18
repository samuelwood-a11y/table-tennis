import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { StandingsTable } from "@/components/leagues/StandingsTable";
import { MatchCard } from "@/components/matches/MatchCard";
import { computeLeagueStandings } from "@/lib/stats";
import { LeagueMatchRow } from "@/components/leagues/LeagueMatchRow";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ groupCode: string; leagueId: string }>;
}) {
  const { groupCode, leagueId } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      players: { include: { player: true } },
      matches: {
        include: {
          sets: true,
          player1: true,
          player2: true,
          team1: { include: { players: { include: { player: true } } } },
          team2: { include: { players: { include: { player: true } } } },
        },
        orderBy: { playedAt: "asc" },
      },
    },
  });

  if (!league || league.groupId !== group.id) notFound();

  const players = league.players.map((lp) => lp.player);
  const standings = computeLeagueStandings(players, league.matches);

  const completed = league.matches.filter((m) => m.status === "COMPLETED");
  const pending = league.matches.filter((m) => m.status === "PENDING");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <PageHeader
          title={league.name}
          subtitle={`${players.length} players · ${completed.length}/${league.matches.length} played`}
          backHref={`/g/${groupCode}/leagues`}
        />
        <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"} className="mt-1">
          {league.status}
        </GlassBadge>
      </div>

      {/* Standings */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Standings</h2>
        <StandingsTable standings={standings} groupCode={groupCode} />
      </div>

      {/* Fixtures */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Fixtures</h2>
          <div className="space-y-2">
            {pending.map((match) => (
              <LeagueMatchRow key={match.id} match={match} groupCode={groupCode} leagueId={leagueId} />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Results</h2>
          <div className="space-y-2">
            {completed.map((match) => (
              <MatchCard key={match.id} match={match} groupCode={groupCode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
