import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { DeletableLeagueList } from "@/components/leagues/DeletableLeagueList";
import Link from "next/link";

export default async function LeaguesPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const leagues = await prisma.league.findMany({
    where: { groupId: group.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { players: true, matches: true } },
      matches: { where: { status: "COMPLETED" }, select: { id: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Leagues"
        subtitle={`${leagues.length} league${leagues.length !== 1 ? "s" : ""}`}
        action={
          <Link href={`/g/${groupCode}/leagues/new`}>
            <GlassButton size="sm">+ New League</GlassButton>
          </Link>
        }
      />

      {leagues.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-white/50 mb-4">No leagues yet</p>
          <Link href={`/g/${groupCode}/leagues/new`}>
            <GlassButton>Create League</GlassButton>
          </Link>
        </div>
      ) : (
        <DeletableLeagueList initialLeagues={leagues} groupCode={groupCode} />
      )}
    </div>
  );
}
