"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTournament(
  groupId: string,
  name: string,
  playerIds: string[]
) {
  if (playerIds.length < 2) throw new Error("Need at least 2 players");

  // Pad to next power of 2
  let size = 1;
  while (size < playerIds.length) size *= 2;

  const tournament = await prisma.$transaction(async (tx) => {
    const t = await tx.tournament.create({
      data: {
        groupId,
        name,
        entries: {
          create: playerIds.map((id, i) => ({ playerId: id, seed: i + 1 })),
        },
      },
    });

    // Create round 1 matches
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    // Pad with nulls for byes
    while (shuffled.length < size) shuffled.push(null as unknown as string);

    const numMatches = size / 2;
    for (let pos = 1; pos <= numMatches; pos++) {
      const p1 = shuffled[(pos - 1) * 2] ?? null;
      const p2 = shuffled[(pos - 1) * 2 + 1] ?? null;
      await tx.match.create({
        data: {
          groupId,
          type: "SINGLES",
          // Auto-advance if one player has a bye
          status: !p1 || !p2 ? "COMPLETED" : "PENDING",
          tournamentId: t.id,
          bracketRound: 1,
          bracketPosition: pos,
          player1Id: p1 ?? undefined,
          player2Id: p2 ?? undefined,
        },
      });
    }

    return t;
  });

  revalidatePath(`/g`);
  return tournament;
}

export async function completeTournament(tournamentId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "COMPLETED" },
  });
  revalidatePath(`/g`);
}

export async function deleteTournament(tournamentId: string) {
  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath(`/g`);
}

export async function archiveTournament(tournamentId: string, groupCode: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { isArchived: true },
  });
  revalidatePath(`/g/${groupCode}/tournaments`);
}

export async function deleteTournamentIfEmpty(tournamentId: string, groupCode: string) {
  const hasResults = await prisma.match.count({
    where: { tournamentId, status: "COMPLETED" },
  });
  if (hasResults > 0) throw new Error("Cannot delete tournament with results. Use archive instead.");
  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath(`/g/${groupCode}/tournaments`);
}

export async function removeTournament(tournamentId: string, groupCode: string): Promise<{ action: "deleted" | "archived" }> {
  const hasResults = await prisma.match.count({ where: { tournamentId, status: "COMPLETED" } });
  if (hasResults > 0) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { isArchived: true } });
    revalidatePath(`/g/${groupCode}/tournaments`);
    return { action: "archived" };
  }
  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath(`/g/${groupCode}/tournaments`);
  return { action: "deleted" };
}
