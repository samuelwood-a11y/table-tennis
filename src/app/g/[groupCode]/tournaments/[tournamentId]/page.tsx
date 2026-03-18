import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { BracketView } from "@/components/tournaments/BracketView";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ groupCode: string; tournamentId: string }>;
}) {
  const { groupCode, tournamentId } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      entries: { include: { player: true } },
      matches: {
        include: {
          sets: true,
          player1: true,
          player2: true,
        },
        orderBy: [{ bracketRound: "asc" }, { bracketPosition: "asc" }],
      },
    },
  });

  if (!tournament || tournament.groupId !== group.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title={tournament.name}
          subtitle={`${tournament.entries.length} players`}
          backHref={`/g/${groupCode}/tournaments`}
        />
        <GlassBadge variant={tournament.status === "ACTIVE" ? "success" : "default"} className="mt-1">
          {tournament.status}
        </GlassBadge>
      </div>

      <BracketView
        tournament={tournament}
        groupCode={groupCode}
      />
    </div>
  );
}
