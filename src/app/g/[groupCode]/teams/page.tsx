import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { TeamAvatar } from "@/components/teams/TeamAvatar";
import Link from "next/link";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const teams = await prisma.team.findMany({
    where: { groupId: group.id, isArchived: false },
    include: {
      players: { include: { player: true } },
      _count: { select: { matchesAsHome: true, matchesAsAway: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Teams"
        action={
          <Link href={`/g/${groupCode}/teams/new`}>
            <GlassButton size="sm">+ New Team</GlassButton>
          </Link>
        }
      />

      {teams.length === 0 ? (
        <GlassCard className="text-center py-12 mt-6">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-white/50 mb-4">No teams yet</p>
          <Link href={`/g/${groupCode}/teams/new`}>
            <GlassButton>Create First Team</GlassButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="mt-6 space-y-3">
          {teams.map((team) => {
            const matchCount = team._count.matchesAsHome + team._count.matchesAsAway;
            return (
              <Link key={team.id} href={`/g/${groupCode}/teams/${team.id}`}>
                <GlassCard hover padding="sm" className="flex items-center gap-4">
                  <TeamAvatar
                    name={team.name}
                    primaryColor={team.primaryColor}
                    imageUrl={team.imageUrl}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg">{team.name}</h3>
                    <p className="text-sm text-white/40">
                      {team.players.length} player{team.players.length !== 1 ? "s" : ""}
                      {matchCount > 0 && ` · ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: team.primaryColor }} />
                    {team.secondaryColor && (
                      <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: team.secondaryColor }} />
                    )}
                  </div>
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
