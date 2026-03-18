"use server";

import { prisma } from "@/lib/prisma";
import { randomAvatarColor } from "@/lib/group";
import { revalidatePath } from "next/cache";

export async function createPlayer(
  groupId: string,
  name: string,
  options?: { avatarColor?: string; emoji?: string | null; nickname?: string; notes?: string }
) {
  if (!name?.trim()) throw new Error("Player name required");

  const player = await prisma.player.create({
    data: {
      groupId,
      name: name.trim(),
      avatarColor: options?.avatarColor ?? randomAvatarColor(),
      emoji: options?.emoji ?? null,
      nickname: options?.nickname ?? null,
      notes: options?.notes ?? null,
    },
  });

  revalidatePath(`/g`);
  return player;
}

export async function updatePlayer(
  playerId: string,
  data: {
    name?: string;
    nickname?: string | null;
    notes?: string | null;
    avatarColor?: string;
    emoji?: string | null;
    imageUrl?: string | null;
  }
) {
  const player = await prisma.player.update({
    where: { id: playerId },
    data,
  });
  revalidatePath(`/g`);
  return player;
}

export async function archiveOrDeletePlayer(playerId: string, groupCode: string) {
  // Check if player has any history
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      singlesMatchesP1: { take: 1 },
      singlesMatchesP2: { take: 1 },
      doublesTeams: { take: 1 },
      leagueEntries: { take: 1 },
      tournamentEntries: { take: 1 },
    },
  });

  if (!player) throw new Error("Player not found");

  const hasHistory =
    player.singlesMatchesP1.length > 0 ||
    player.singlesMatchesP2.length > 0 ||
    player.doublesTeams.length > 0 ||
    player.leagueEntries.length > 0 ||
    player.tournamentEntries.length > 0;

  if (hasHistory) {
    // Archive — keep in history, hide from active lists
    await prisma.player.update({
      where: { id: playerId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  } else {
    // Hard delete — no history
    await prisma.player.delete({ where: { id: playerId } });
  }

  revalidatePath(`/g/${groupCode}/players`);
  return { archived: hasHistory };
}

export async function deletePlayer(playerId: string, groupCode: string) {
  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath(`/g/${groupCode}/players`);
}
