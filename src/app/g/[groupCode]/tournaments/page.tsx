import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { DeletableTournamentList } from "@/components/tournaments/DeletableTournamentList";
import Link from "next/link";

export default async function TournamentsPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const tournaments = await prisma.tournament.findMany({
    where: { groupId: group.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { entries: true, matches: true } },
      matches: { where: { status: "COMPLETED" }, select: { id: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Tournaments"
        subtitle={`${tournaments.length} tournament${tournaments.length !== 1 ? "s" : ""}`}
        action={
          <Link href={`/g/${groupCode}/tournaments/new`}>
            <GlassButton size="sm">+ New Tournament</GlassButton>
          </Link>
        }
      />

      {tournaments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-white/50 mb-4">No tournaments yet</p>
          <Link href={`/g/${groupCode}/tournaments/new`}>
            <GlassButton>Create Tournament</GlassButton>
          </Link>
        </div>
      ) : (
        <DeletableTournamentList initialTournaments={tournaments} groupCode={groupCode} />
      )}
    </div>
  );
}
