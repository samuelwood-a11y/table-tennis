import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { StandingsTable } from "@/components/leagues/StandingsTable";
import { PairStandingsTable } from "@/components/leagues/PairStandingsTable";
import { RotatingDoublesStandings } from "@/components/leagues/RotatingDoublesStandings";
import { RotatingFixtureRow } from "@/components/leagues/RotatingFixtureRow";
import { LeagueMatchRow } from "@/components/leagues/LeagueMatchRow";
import { PaymentTracker } from "@/components/leagues/PaymentTracker";
import { MatchCard } from "@/components/matches/MatchCard";
import { computeLeagueStandings, computeRotatingDoublesStandings } from "@/lib/stats";
import { computeDoublesPairStandings } from "@/lib/doubles-pairs";

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
          referee: true,
        },
        orderBy: { playedAt: "asc" },
      },
      prizeRows: { orderBy: { position: "asc" } },
      payments: { include: { player: true } },
    },
  });

  if (!league || league.groupId !== group.id) notFound();

  const players = league.players.map((lp) => lp.player);
  const isRotating = league.format === "ROTATING_DOUBLES";
  const isPairDoubles = league.format === "FIXED_DOUBLES" || league.format === "RANDOM_DOUBLES";

  const completed = league.matches.filter((m) => m.status === "COMPLETED");
  const pending = league.matches.filter((m) => m.status === "PENDING");
  const completedCount = completed.length;
  const totalCount = league.matches.length;

  // Collect unique DoublesTeams from the pair-doubles league matches
  const doublesTeamsMap = new Map<string, any>();
  if (isPairDoubles) {
    for (const m of league.matches) {
      if (m.team1) doublesTeamsMap.set(m.team1.id, m.team1);
      if (m.team2) doublesTeamsMap.set(m.team2.id, m.team2);
    }
  }

  const pairStandings = isPairDoubles
    ? computeDoublesPairStandings(
        Array.from(doublesTeamsMap.values()),
        league.matches as any
      )
    : null;

  const standings =
    isPairDoubles
      ? null
      : isRotating
      ? computeRotatingDoublesStandings(players as any, league.matches as any)
      : computeLeagueStandings(players, league.matches as any);

  const formatLabel: Record<string, string> = {
    FIXED_DOUBLES: "Fixed Pairs",
    RANDOM_DOUBLES: "Random Pairs",
    ROTATING_DOUBLES: "Rotating Pairs",
    SINGLES: "Singles",
    DOUBLES: "Doubles",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <PageHeader
          title={league.name}
          subtitle={`${isPairDoubles ? `${doublesTeamsMap.size} pairs` : `${players.length} players`} · ${completedCount}/${totalCount} played`}
          backHref={`/g/${groupCode}/leagues`}
        />
        <div className="flex items-center gap-2 mt-1">
          {(isRotating || isPairDoubles) && (
            <GlassBadge variant="info">{formatLabel[league.format] ?? league.format}</GlassBadge>
          )}
          <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"}>
            {league.status}
          </GlassBadge>
        </div>
      </div>

      {/* Standings */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          {isPairDoubles ? "Pair Standings" : isRotating ? "Individual Standings" : "Standings"}
        </h2>
        {isPairDoubles && pairStandings ? (
          <PairStandingsTable standings={pairStandings} />
        ) : isRotating ? (
          <RotatingDoublesStandings standings={standings as any} groupCode={groupCode} />
        ) : (
          <StandingsTable standings={standings as any} groupCode={groupCode} />
        )}
      </div>

      {/* Prize & Payments */}
      {(league.payments.length > 0 || league.prizeRows.length > 0) && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Prize & Payments</h2>
          <PaymentTracker
            payments={league.payments as any}
            currency={league.currency}
            expectedPot={league.expectedPot}
            prizeRows={league.prizeRows}
          />
        </div>
      )}

      {/* Fixtures */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Fixtures</h2>
          <div className="space-y-2">
            {isRotating
              ? pending.map((match, i) => (
                  <RotatingFixtureRow key={match.id} match={match as any} fixtureNumber={completedCount + i + 1} />
                ))
              : pending.map((match) => (
                  <LeagueMatchRow key={match.id} match={match as any} groupCode={groupCode} leagueId={leagueId} />
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
              <MatchCard key={match.id} match={match as any} groupCode={groupCode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
