import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
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
    },
  });

  return (
    <div>
      <PageHeader
        title="Tournaments"
        subtitle={`${tournaments.length} tournaments`}
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
        <div className="space-y-3">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/g/${groupCode}/tournaments/${t.id}`}>
              <GlassCard hover className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">
                      {t._count.entries} players · {t._count.matches} matches
                    </p>
                  </div>
                </div>
                <GlassBadge variant={t.status === "ACTIVE" ? "success" : "default"}>
                  {t.status}
                </GlassBadge>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
