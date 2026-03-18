"use server";

import { prisma } from "@/lib/prisma";
import { generateRoundRobin } from "@/lib/round-robin";
import { revalidatePath } from "next/cache";

export async function createLeague(groupId: string, name: string, playerIds: string[]) {
  if (playerIds.length < 2) throw new Error("Need at least 2 players");

  const league = await prisma.$transaction(async (tx) => {
    const l = await tx.league.create({
      data: {
        groupId,
        name,
        players: {
          create: playerIds.map((id) => ({ playerId: id })),
        },
      },
    });

    const fixtures = generateRoundRobin(playerIds.length);
    await tx.match.createMany({
      data: fixtures.map(([i, j]) => ({
        groupId,
        type: "SINGLES" as const,
        status: "PENDING" as const,
        player1Id: playerIds[i],
        player2Id: playerIds[j],
        leagueId: l.id,
      })),
    });

    return l;
  });

  revalidatePath(`/g`);
  return league;
}

export async function completeLeague(leagueId: string) {
  await prisma.league.update({ where: { id: leagueId }, data: { status: "COMPLETED" } });
  revalidatePath(`/g`);
}

export async function deleteLeague(leagueId: string) {
  await prisma.league.delete({ where: { id: leagueId } });
  revalidatePath(`/g`);
}
