import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { MatchCard } from "@/components/matches/MatchCard";
import Link from "next/link";

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const matches = await prisma.match.findMany({
    where: { groupId: group.id },
    orderBy: { playedAt: "desc" },
    include: {
      sets: true,
      player1: true,
      player2: true,
      team1: { include: { players: { include: { player: true } } } },
      team2: { include: { players: { include: { player: true } } } },
    },
  });

  const completed = matches.filter((m) => m.status === "COMPLETED");
  const pending = matches.filter((m) => m.status === "PENDING" && !m.leagueId && !m.tournamentId);

  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle={`${completed.length} completed`}
        action={
          <Link href={`/g/${groupCode}/matches/new`}>
            <GlassButton size="sm">+ Record Match</GlassButton>
          </Link>
        }
      />

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏓</div>
          <p className="text-white/50 mb-4">No matches recorded yet</p>
          <Link href={`/g/${groupCode}/matches/new`}>
            <GlassButton>Record First Match</GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Pending</h2>
              <div className="space-y-2">
                {pending.map((match) => (
                  <MatchCard key={match.id} match={match} groupCode={groupCode} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Completed</h2>
            <div className="space-y-2">
              {completed.map((match) => (
                <MatchCard key={match.id} match={match} groupCode={groupCode} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
