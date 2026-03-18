import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGroupByCode } from "@/actions/groups";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlayerCard } from "@/components/players/PlayerCard";
import { computePlayerStats } from "@/lib/stats";
import Link from "next/link";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  const players = await prisma.player.findMany({
    where: { groupId: group.id },
    orderBy: { createdAt: "asc" },
  });

  const allMatches = await prisma.match.findMany({
    where: { groupId: group.id },
    include: {
      sets: true,
      player1: true,
      player2: true,
      team1: { include: { players: { include: { player: true } } } },
      team2: { include: { players: { include: { player: true } } } },
    },
  });

  const playerStats = players.map((p) =>
    computePlayerStats(p.id, p.name, p.avatarColor, allMatches)
  );

  const sorted = [...players].sort((a, b) => {
    const sa = playerStats.find((s) => s.playerId === a.id)!;
    const sb = playerStats.find((s) => s.playerId === b.id)!;
    return sb.winRate - sa.winRate;
  });

  return (
    <div>
      <PageHeader
        title="Players"
        subtitle={`${players.length} players in this group`}
        action={
          <Link href={`/g/${groupCode}/players/new`}>
            <GlassButton size="sm">+ Add Player</GlassButton>
          </Link>
        }
      />

      {players.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-white/50 mb-4">No players yet</p>
          <Link href={`/g/${groupCode}/players/new`}>
            <GlassButton>Add First Player</GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((player, i) => {
            const stats = playerStats.find((s) => s.playerId === player.id)!;
            return (
              <PlayerCard
                key={player.id}
                player={player}
                stats={stats}
                groupCode={groupCode}
                rank={i + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
