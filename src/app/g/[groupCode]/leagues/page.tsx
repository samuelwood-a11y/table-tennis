import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
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
    },
  });

  return (
    <div>
      <PageHeader
        title="Leagues"
        subtitle={`${leagues.length} leagues`}
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
        <div className="space-y-3">
          {leagues.map((league) => (
            <Link key={league.id} href={`/g/${groupCode}/leagues/${league.id}`}>
              <GlassCard hover className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-white">{league.name}</p>
                    <p className="text-xs text-white/40">
                      {league._count.players} players · {league._count.matches} fixtures
                    </p>
                  </div>
                </div>
                <GlassBadge variant={league.status === "ACTIVE" ? "success" : "default"}>
                  {league.status}
                </GlassBadge>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
